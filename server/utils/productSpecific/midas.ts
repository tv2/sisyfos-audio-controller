import * as DEFAULTS from '../../constants/DEFAULTS';
import { SET_ALL_VU_LEVELS } from  '../../reducers/faderActions'

export const midasMeter = (message: any) => {
    const store = global.storeRedux.getState();

    const headerData = 4;
    let uint8bytes = Uint8Array.from(message[0]);
    let dataview = new DataView(uint8bytes.buffer);
    //console.log(dataview);
    let vuMeters = [];
    let numberOfChannels = store.settings[0].numberOfChannelsInType[0];

    for (let i=0; i < numberOfChannels; i++) {
        vuMeters.push({vuVal : dataview.getFloat32(4*i+headerData , true)});
    }
    global.storeRedux.dispatch({
        type: SET_ALL_VU_LEVELS,
        vuMeters: vuMeters
    });

};

