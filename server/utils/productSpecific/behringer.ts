import * as DEFAULTS from '../../constants/DEFAULTS';
import { SET_VU_LEVEL } from '../../reducers/faderActions'
import { SOCKET_SET_VU } from '../../constants/SOCKET_IO_DISPATCHERS';


export const behringerMeter = (message: any) => {
    const store = global.storeRedux.getState();

    //Test data from Behringer:
    //message = [40, 0, 0, 0, 133, 157, 183, 156, 72, 154, 101, 157, 229, 162, 241, 158, 253, 162, 156, 162, 131, 162, 253, 162, 81, 162, 29, 162, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 0, 128, 223, 157, 223, 157, 223, 157, 223, 157];

    let uint8bytes = Uint8Array.from(message[0]);
    let dataview = new DataView(uint8bytes.buffer);

    for (let i=0; i < store.settings[0].numberOfChannelsInType[0]; i++) {
        let level = (dataview.getInt16(2*(i+2) , true) + 8000)/8000
        global.storeRedux.dispatch({
            type:SET_VU_LEVEL,
            channel: i,
            level: level
        });
        global.socketServer.emit(
            SOCKET_SET_VU, 
            {
                faderIndex: store.channels[0].channel[i].assignedFader,
                level: level
            }
        )
    }
};

