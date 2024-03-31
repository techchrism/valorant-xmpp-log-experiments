import {promises as fs } from 'node:fs'
import path from 'node:path'
import {DataLogLine, isDataLogLine, LogLine} from './loggerTypes'
import ProgressBar from 'progress'
import {XMLParser, XMLValidator} from 'fast-xml-parser'
import {TempValuesExperiment} from './experiments/TempValuesExperiment'

async function getLogLines(logFilePath: string): Promise<LogLine[]> {
    const logLines = (await fs.readFile(logFilePath, 'utf-8')).split('\n')
    if(logLines.length === 0) throw new Error('Empty log file')
    try {
        const parsedFirstLine = JSON.parse(logLines[0])
        if(parsedFirstLine.type !== 'valorant-xmpp-logger') {
            throw new Error('Invalid log file')
        }
    } catch(e) {
        throw new Error('Invalid log file')
    }
    return logLines.filter(l => l.length > 0).map(l => JSON.parse(l))
}

async function main() {
    const logsPath = process.argv[2]
    if(logsPath === undefined) {
        console.error('Usage: node . <path to logs>')
        process.exit(1)
    }

    const logFiles = await (async () => {
        try {
            return (await fs.readdir(logsPath, {withFileTypes: true})).filter(f => f.isFile()).map(f => path.join(f.path, f.name))
        } catch(e) {
            console.error('Invalid path:')
            console.error(e)
            process.exit(1)
        }
    })()

    console.log(`Found ${logFiles.length} log files`)
    const tempValuesExperiment = new TempValuesExperiment()

    const bar = new ProgressBar('Processing [:bar] :percent :etas', {
        total: logFiles.length
    })

    for(const logFile of logFiles) {
        bar.tick()

        // The biggest files I've seen are around 30MB which should be fine to load in ram in one go
        const logLines = await (async () => {
            try {
                return await getLogLines(logFile)
            } catch(e) {
                return undefined
            }
        })()
        if(logLines === undefined) continue

        const parser = new XMLParser({ignoreAttributes: false, attributeNamePrefix: '@_'})
        const xmlBuffers = new Map<string, string>()
        for(const logLine of logLines) {
            if(!isDataLogLine(logLine) || logLine.data.includes('<stream:stream')) continue

            const xmlString = (xmlBuffers.get(logLine.type) ?? '') + logLine.data
            if(XMLValidator.validate(`<a>${xmlString}</a>`) !== true) {
                xmlBuffers.set(logLine.type, xmlString)
                continue
            } else {
                xmlBuffers.delete(logLine.type)
            }

            const parsedXML = parser.parse(xmlString)
            tempValuesExperiment.onXML(parsedXML, logLine.time)
        }
    }

    tempValuesExperiment.logFindings()
}

main()