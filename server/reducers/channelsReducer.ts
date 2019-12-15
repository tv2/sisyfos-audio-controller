import { 
    SET_OUTPUT_LEVEL,
    SET_ASSIGNED_FADER,
    SET_COMPLETE_CH_STATE,
    SET_OPTION,
    SET_PRIVATE,
    FADE_ACTIVE,
    SET_AUX_LEVEL
} from './channelActions'

export interface IChannels {
    channel: Array<IChannel>
}

export interface IChannel {
    channelType: number,
    channelTypeIndex: number,
    assignedFader: number,
    fadeActive: boolean,
    outputLevel: number,
    auxLevel: number[],
    private?: {
        [key: string]: string
    }
}

const defaultChannelsReducerState = (numberOfTypeChannels: Array<number>) => {
    let defaultObj: Array<IChannels> = [{
        channel: []
    }];

    let totalNumberOfChannels = 0;
    numberOfTypeChannels.forEach((numberOfChannels, typeIndex) => {
        for (let index=0; index < numberOfChannels; index++) {
            defaultObj[0].channel[totalNumberOfChannels] = ({
                channelType: typeIndex,
                channelTypeIndex: index,
                assignedFader: totalNumberOfChannels,
                fadeActive: false,
                outputLevel: 0.0,
                auxLevel: []
            });
            totalNumberOfChannels ++;
        }
    })
    return defaultObj;
};

export const channels = ((state = defaultChannelsReducerState([1]), action: any): Array<IChannels> => {

    let nextState = [{
        channel: [...state[0].channel]
    }];

    switch(action.type) {
        case SET_OUTPUT_LEVEL: //channel:  level:
            nextState[0].channel[action.channel].outputLevel = parseFloat(action.level);
            return nextState;
        case SET_COMPLETE_CH_STATE: //allState  //numberOfChannels
            nextState = defaultChannelsReducerState(action.numberOfTypeChannels);
            if (action.allState.channel.length == nextState[0].channel.length) {
                action.allState.channel.map((channel: any, index: number) => {
                    if (index < action.numberOfTypeChannels[0]) {
                        nextState[0].channel[index] = channel;
                    }
                });
            }
            return nextState;
        case FADE_ACTIVE:
            nextState[0].channel[action.channel].fadeActive = !!action.active;
            return nextState;
        case SET_ASSIGNED_FADER: //channel:  faderNumber:
            nextState[0].channel[action.channel].assignedFader = action.faderNumber
            return nextState;
        case SET_AUX_LEVEL: //channel:  auxIndex: level:
            nextState[0].channel[action.channel].auxLevel[action.auxIndex] = parseFloat(action.level);
            return nextState;
        case SET_PRIVATE:
            if (!nextState[0].channel[action.channel].private) {
                nextState[0].channel[action.channel].private = {};
            }
            nextState[0].channel[action.channel].private![action.tag] = action.value;
            return nextState;
        case SET_OPTION:
            console.log(action);
            // TODO: This should be changed, as it´s not the "redux" way of handling it.
            // @ts-ignore
            global.mixerGenericConnection.updateChannelSettings(action.channel, action.prop, action.option);
            return nextState;
        default:
            return nextState;
    }
});
