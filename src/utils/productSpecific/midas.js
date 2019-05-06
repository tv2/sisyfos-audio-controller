export const midasMeter = (message) => {
    const store = window.storeRedux.getState();

    //Test data from Behringer:
    //message = [40, 0, 0, 0, 133, 157, 183, 156, 72, 154, 101, 157, 229, 162, 241, 158, 253, 162, 156, 162, 131, 162, 253, 162, 81, 162, 29, 162, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 223, 157, 223, 157, 223, 157, 223, 157];

    const headerData = 4;
    let uint8bytes = Uint8Array.from(message[0]);
    let dataview = new DataView(uint8bytes.buffer);
    //console.log(dataview);
    let vuMeters = [];

    for (let i=0; i < store.settings[0].numberOfChannels; i++) {
        vuMeters.push({vuVal : dataview.getFloat32(4*i+headerData , true)});
    }
    window.storeRedux.dispatch({
        type:'SET_ALL_VU_LEVELS',
        vuMeters: vuMeters
    });

};
