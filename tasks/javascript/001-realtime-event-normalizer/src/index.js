class EventService {
    types = ['connected', 'disconnected', 'position', 'battery']

    isValidType(type) {
        if (this.types.includes(type)) return true

        return false
    }

    isAllRequiredFields(event) {
        if (!event.deviceId) return false
        if (!event.timestamp) return false

        return true
    }

    setOnline(event, state) {
        if (event.type === 'connected') {
            return {...state, online: true}
        } else if (event.type === 'disconnected') {
            return {...state, online: false}
        }

        return {...state}
    }

    setPosition(event, state) {
        const lat = Number(event.payload?.lat)
        const lng = Number(event.payload?.lng)

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return { ...state }
        }

        return {
            ...state,
            position: { lat, lng },
        }
    }

    setBattery(event, state) {
        const value = event.payload?.value
        const num = Number(value)

        if (!Number.isFinite(num)) {
            return state
        }

        if (num < 0 || num > 100) {
            return state
        }

        const warnings = num < 20 && !state.warnings.includes('low-battery')
            ? [...state.warnings, 'low-battery']
            : state.warnings

        return {
            ...state,
            battery: num,
            warnings,
        }
    }

    normalizeEvents(events) {
        const newEvents = []

        for (let event of events) {
            if (!this.isValidType(event.type)) continue
            if (!this.isAllRequiredFields(event)) continue
            if (!event.payload && (event.type !== 'connected' && event.type !== 'disconnected')) continue

            if (!event.battery) {
                event = {...event, battery: null}
            }

            if (!event.online) {
                event = {...event, online: false}
            }

            if (!event.warnings) {
                event = {...event, warnings: []}
            }

            if (!event.position) {
                event = {...event, position: null}
            }

            newEvents.push(event)
        }

        return [...newEvents].sort((a, b) => {
            return new Date(a.timestamp) - new Date(b.timestamp);
        });
    }

    setNewValues(event, state) {
        let newState = {}
        switch (event.type) {
            case 'battery':
                newState = this.setBattery(event, state)
                break
            case 'connected':
            case 'disconnected':
                newState = this.setOnline(event, state)
                break
            case 'position':
                newState = this.setPosition(event, state)
                break
            default:
                newState = state
        }


        if (newState.timestamp) {
            delete newState.timestamp
        }

        if (newState.type) {
            delete newState.type
        }

        if (newState.payload) {
            delete newState.payload
        }

        newState.lastSeen = event.timestamp

        return newState
    }
}

let eventService = new EventService()

function buildDeviceState(events) {
    events = eventService.normalizeEvents(events)

    let newEvents = []
    const newEventsIds = []
    for (const event of events) {
        if (newEventsIds.includes(event.deviceId)) {
            const targetId = event.deviceId;

            newEvents = newEvents.map(e =>
                e.deviceId === targetId ? eventService.setNewValues(event, e) : e
            );
        } else {
            newEvents.push(eventService.setNewValues(event, event))
            newEventsIds.push(event.deviceId)
        }
    }

    return newEvents.sort((a, b) => a.deviceId.localeCompare(b.deviceId));;
}

module.exports = {
    buildDeviceState,
};
