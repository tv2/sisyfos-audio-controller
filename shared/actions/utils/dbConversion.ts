import { VuLabelConversionType } from '../../constants/MixerProtocolInterface'

export const Conversions = {
    [VuLabelConversionType.Decibel]: {
        to: (f: number): number => {
            if (f >= 0.5) {
                return f * 40 - 30 // max dB value: +10.
            } else if (f >= 0.25) {
                return f * 80 - 50
            } else if (f >= 0.0625) {
                return f * 160 - 70
            } else if (f > 0.0) {
                return f * 480 - 90 // min dB value: -90 or -oo
            } else {
                return -Infinity
            }
        },
        from: (d: number): number => {
            let f: number
            if (d < -60) {
                f = (d + 90) / 480
            } else if (d < -30) {
                f = (d + 70) / 160
            } else if (d < -10) {
                f = (d + 50) / 80
            } else if (d <= 10) {
                f = (d + 30) / 40
            } else {
                f = 1
            }
            return Math.max(0, f)
        },
    },
    [VuLabelConversionType.DecibelRuby]: {
        to: (f: number): number =>
            Math.max(Conversions[VuLabelConversionType.Decibel].to(f), -191),
        from: (d: number): number =>
            Conversions[VuLabelConversionType.Decibel].from(d),
    },
    [VuLabelConversionType.DecibelMC2]: {
        to: (f: number): number =>
            Math.max(Conversions[VuLabelConversionType.Decibel].to(f), -128),
        from: (d: number): number =>
            Conversions[VuLabelConversionType.Decibel].from(d),
    },
}
