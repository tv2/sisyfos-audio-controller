import * as DEFAULTS from '../constants/DEFAULTS';

export interface IChannels {
    channel: Array<IChannel>,
    vuMeters: Array<IVuMeters>,
}

export interface IChannel {
    channelType: number,
    channelTypeIndex: number,
    assignedFader: number,
    fadeActive: boolean,
    faderLevel: number,
    outputLevel: number,
    pflOn: boolean,
    private?: {
        [key: string]: string
    }
}

interface IVuMeters {
    vuVal: number
}

const defaultChannelsReducerState = (numberOfTypeChannels: Array<number>) => {
    let defaultObj: Array<IChannels> = [{
        channel: [],
        vuMeters: [],
    }];

    let totalNumberOfChannels = 0;
    numberOfTypeChannels.forEach((numberOfChannels, typeIndex) => {
        for (let index=0; index < numberOfChannels; index++) {
            defaultObj[0].channel[totalNumberOfChannels] = ({
                channelType: typeIndex,
                channelTypeIndex: index,
                assignedFader: 0,
                fadeActive: false,
                faderLevel: 0,
                outputLevel: 0.0,
                pflOn: false,
            });
            defaultObj[0].vuMeters.push({
                vuVal: 0.0
            });
            totalNumberOfChannels ++;
        }
    })
    return defaultObj;
};

export const channels = ((state = defaultChannelsReducerState([1]), action: any): Array<IChannels> => {

    let nextState = [{
        vuMeters: [...state[0].vuMeters],
        channel: [...state[0].channel],
    }];

    switch(action.type) {
        case 'SET_OUTPUT_LEVEL': //channel:  level:
            nextState[0].channel[action.channel].outputLevel = parseFloat(action.level);
            return nextState;
        case 'SET_VU_LEVEL': //channel:  level:
            if (typeof nextState[0].vuMeters[action.channel] != 'undefined') {
                nextState[0].vuMeters[action.channel].vuVal = parseFloat(action.level);
            }
            return nextState;
        case 'SET_COMPLETE_STATE': //allState  //numberOfChannels
            nextState = defaultChannelsReducerState(action.numberOfTypeChannels);
            if (action.allState.channel.length == nextState[0].channel.length) {
                action.allState.channel.map((channel: any, index: number) => {
                    nextState[0].channel[index] = channel;
                });
            }
            return nextState;
        case 'FADE_ACTIVE':
            nextState[0].channel[action.channel].fadeActive = !!action.active;
            return nextState;
        case 'SET_FADER_LEVEL': //channel:  level:
            nextState[0].channel[action.channel].faderLevel = parseFloat(action.level);
            return nextState;
        case 'SET_ALL_VU_LEVELS': //channel:  level:
            nextState[0].vuMeters = action.vuMeters;
            return nextState;
        case 'SET_PRIVATE':
            if (!nextState[0].channel[action.channel].private) {
                nextState[0].channel[action.channel].private = {};
            }
            nextState[0].channel[action.channel].private![action.tag] = action.value;
            return nextState;
        case 'SET_OPTION':
            console.log(action);
            window.mixerGenericConnection.updateChannelSettings(action.channel, action.prop, action.option);
            return nextState;
        default:
            return nextState;
    }
});
