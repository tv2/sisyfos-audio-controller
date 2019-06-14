import React, { PureComponent } from 'react';
import { connect } from "react-redux";

//assets:
import '../assets/css/VuMeter.css';
//Utils:
import { IMixerProtocol, MixerProtocolPresets, IMixerProtocolGeneric } from '../constants/MixerProtocolPresets';
import { any } from 'prop-types';
import { VuMeter, IVuMeterInjectedProps } from './VuMeter';

interface IGrpVuMeterProps {
    faderIndex: number
}

const mapStateToProps = (state: any, props: any): IVuMeterInjectedProps => {
    return {
        vuVal: state.channels[0].grpVuMeters[props.faderIndex].vuVal,
        mixerProtocol: state.settings[0].mixerProtocol,
        showSnaps: state.settings[0].showSnaps
    }
}

export default connect<any, any>(mapStateToProps)(VuMeter) as any;
