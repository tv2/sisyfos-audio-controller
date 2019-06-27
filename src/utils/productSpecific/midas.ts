import * as DEFAULTS from '../../constants/DEFAULTS';

export const midasMeter = (message: any) => {
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

