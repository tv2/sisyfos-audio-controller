import { DEFAULTS } from '../../constants/DEFAULTS';

export const midasMeter = (message) => {
    const store = window.storeRedux.getState();

    const headerData = 4;
    let uint8bytes = Uint8Array.from(message[0]);
    let dataview = new DataView(uint8bytes.buffer);
    //console.log(dataview);
    let vuMeters = [];
    let numberOfChannels = store.settings[0].numberOfChannels;

    for (let i=0; i < numberOfChannels; i++) {
        vuMeters.push({vuVal : dataview.getFloat32(4*i+headerData , true)});
    }
    window.storeRedux.dispatch({
        type:'SET_ALL_VU_LEVELS',
        vuMeters: vuMeters
    });

};


export const midasGrpMeter = (message) => {
    const store = window.storeRedux.getState();

    const headerData = 4;
    let uint8bytes = Uint8Array.from(message[0]);
    let dataview = new DataView(uint8bytes.buffer);
    //console.log(dataview);
    let vuMeters = [];


    for (let i=0; i < DEFAULTS.NUMBER_OF_GROUP_FADERS; i++) {
        vuMeters.push({vuVal : dataview.getFloat32(4*i+headerData , true)});
    }
    window.storeRedux.dispatch({
        type:'SET_ALL_GRP_VU_LEVELS',
        grpVuMeters: vuMeters
    });

};
