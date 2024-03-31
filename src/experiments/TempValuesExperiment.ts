


export class TempValuesExperiment {
    private _tempValues = new Map<string, {
        firstSeen: number
        lastSeen: number
        observedValues: Set<any>
    }>

    public onXML(xmlData: any, time: number) {
        const valorantPresenceEncoded = xmlData['presence']?.['games']?.['valorant']?.['p'] as string | undefined
        if(valorantPresenceEncoded === undefined) return

        const presenceData = (() => {
            try {
                return JSON.parse(Buffer.from(valorantPresenceEncoded, 'base64').toString('utf-8'))
            } catch(e) {
                return undefined
            }
        })()
        if(presenceData === undefined) return

        const tempEntries = Object.entries(presenceData).filter(([key, value]) => key.startsWith('temp'))
        for(const [key, value] of tempEntries) {
            const tempEntry = (() => {
                const existing = this._tempValues.get(key)
                if(existing === undefined) {
                    const entry = {
                        firstSeen: time,
                        lastSeen: time,
                        observedValues: new Set()
                    }
                    this._tempValues.set(key, entry)
                    return entry
                }
                return existing
            })()

            tempEntry.lastSeen = time
            tempEntry.observedValues.add(value)
        }
    }

    public logFindings() {
        console.group('Temp values:')
        console.group(`Found ${this._tempValues.size} temp values${this._tempValues.size > 0 ? ':' : ''}`)
        for(const [key, value] of this._tempValues.entries()) {
            console.group(key)
            console.log(`First seen: ${value.firstSeen}`)
            console.log(`Last seen: ${value.lastSeen}`)
            console.log(`Observed values: ${Array.from(value.observedValues).join(', ')}`)
            console.groupEnd()
        }
        console.groupEnd()
        console.groupEnd()
    }
}