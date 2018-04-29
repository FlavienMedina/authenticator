import jsSHA from 'jssha'

export default class TOTP {
  constructor(secret, duration = 30) {
    this.secret = secret
    this.duration = duration
  }

  generate() {
    const key = this._ascii2hex(this.secret)
    const epoch = Math.round(new Date().getTime() / 1000.0)
    const time = this._leftpad(
      this._dec2hex(Math.floor(epoch / this.duration)),
      16,
      '0'
    )

    const shaObj = new jsSHA('SHA-1', 'HEX')
    shaObj.setHMACKey(key, 'HEX')
    shaObj.update(time)

    const hmac = shaObj.getHMAC('HEX')

    const offset = this._hex2dec(hmac.substring(hmac.length - 1))

    let otp =
      (this._hex2dec(hmac.substr(offset * 2, 8)) & this._hex2dec('7fffffff')) +
      ''
    return otp.substr(otp.length - 6, 6)
  }

  _dec2hex(s) {
    return (s < 15.5 ? '0' : '') + Math.round(s).toString(16)
  }

  _hex2dec(s) {
    return parseInt(s, 16)
  }

  _base32tohex(base32) {
    let base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let bits = ''
    let hex = ''

    for (let i = 0; i < base32.length; i++) {
      let val = base32chars.indexOf(base32.charAt(i).toUpperCase())
      bits += this._leftpad(val.toString(2), 5, '0')
    }

    for (let i = 0; i + 4 <= bits.length; i += 4) {
      let chunk = bits.substr(i, 4)
      hex = hex + parseInt(chunk, 2).toString(16)
    }
    return hex
  }

  _ascii2hex(ascii) {
    let arr = []
    for (let i = 0, l = ascii.length; i < l; i++) {
      let hex = Number(ascii.charCodeAt(i)).toString(16)
      arr.push(hex)
    }
    return arr.join('')
  }

  _leftpad(str, len, pad) {
    if (len + 1 >= str.length) {
      str = Array(len + 1 - str.length).join(pad) + str
    }
    return str
  }
}
