// ─── Turbine configurations ───────────────────────────────────────────────────
// r: rotor radius (m), Prated: rated power (W),
// vin/vout: cut-in/cut-out (m/s), Cp: power coefficient,
// costLo/costHi: installed cost range ($)
export const TURBINES = {
  micro: {
    label: 'Micro DIY',
    subtitle: '1 m rotor · ~75 W',
    r: 0.50, Prated: 75, vin: 2.5, vout: 18, Cp: 0.30,
    costLo: 200, costHi: 400,
  },
  small: {
    label: 'Small Residential',
    subtitle: '1.8 m rotor · ~400 W',
    r: 0.90, Prated: 400, vin: 2.5, vout: 20, Cp: 0.32,
    costLo: 700, costHi: 1100,
  },
  mid: {
    label: 'Mid Residential',
    subtitle: '3 m rotor · ~1 kW',
    r: 1.50, Prated: 1000, vin: 2.5, vout: 22, Cp: 0.35,
    costLo: 2500, costHi: 3500,
  },
  large: {
    label: 'Full Residential',
    subtitle: '5 m rotor · ~3 kW',
    r: 2.50, Prated: 3000, vin: 2.5, vout: 25, Cp: 0.38,
    costLo: 8000, costHi: 11000,
  },
}

// ─── EIA 2024 avg residential electricity rates (cents/kWh) by state ─────────
export const STATE_RATES = {
  AL:13.2, AK:22.7, AZ:13.1, AR:10.8, CA:28.0, CO:13.7, CT:27.0,
  DE:14.7, FL:13.5, GA:12.4, HI:39.8, ID:10.3, IL:14.0, IN:13.1,
  IA:12.0, KS:13.2, KY:11.7, LA:10.2, ME:24.0, MD:15.0, MA:26.0,
  MI:17.0, MN:14.0, MS:12.0, MO:12.8, MT:12.5, NE:11.2, NV:12.0,
  NH:25.0, NJ:17.0, NM:13.0, NY:22.0, NC:12.5, ND:11.0, OH:13.5,
  OK:10.5, OR:11.5, PA:15.5, RI:28.0, SC:13.5, SD:12.0, TN:11.0,
  TX:13.0, UT:11.0, VT:22.0, VA:12.5, WA:10.5, WV:12.0, WI:15.5,
  WY:11.5, DC:15.0,
}

// ─── Wind viability classes ───────────────────────────────────────────────────
export const WIND_CLASSES = [
  { min: 0,   max: 4,   label: 'Poor',      color: '#dc2626', tip: 'Not economically viable for turbines.' },
  { min: 4,   max: 7,   label: 'Marginal',  color: '#d97706', tip: 'Borderline — small turbines only.' },
  { min: 7,   max: 10,  label: 'Fair',      color: '#ca8a04', tip: 'A small turbine can offset some bills.' },
  { min: 10,  max: 13,  label: 'Good',      color: '#16a34a', tip: 'Good wind resource — solid economics.' },
  { min: 13,  max: 999, label: 'Excellent', color: '#0d9488', tip: 'Excellent site! Strong ROI expected.' },
]

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
export const DIRS   = ['N','NE','E','SE','S','SW','W','NW']

export const AIR_DENSITY = 1.225 // kg/m³ at sea level
export const CO2_KG_PER_KWH = 0.386 // US avg grid emissions factor (2023 EPA)
