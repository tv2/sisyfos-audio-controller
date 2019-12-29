import { store, state } from '../../reducers/store'

import * as DEFAULTS from '../../constants/DEFAULTS';
import { SET_ALL_VU_LEVELS } from  '../../reducers/faderActions'
import { SOCKET_SET_VU } from '../../constants/SOCKET_IO_DISPATCHERS';

export const midasMeter = (message: any) => {

    const headerData = 4;
    let uint8bytes = Uint8Array.from(message[0]);
    let dataview = new DataView(uint8bytes.buffer);
    let vuMeters = [];
    let numberOfChannels = state.settings[0].numberOfChannelsInType[0];

    for (let i=0; i < numberOfChannels; i++) {
        let level = dataview.getFloat32(4*i+headerData , true)
        vuMeters.push({vuVal : level});
        global.socketServer.emit(
            SOCKET_SET_VU, 
            {
                faderIndex: state.channels[0].channel[i].assignedFader,
                level: level
            }
        )
    }
    store.dispatch({
        type: SET_ALL_VU_LEVELS,
        vuMeters: vuMeters
    });


};

