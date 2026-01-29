declare const EncodeUtils: {
  base64Encode: (str: string) => string
  base64Decode: (str: string) => string
  utf8Encode: (str: string) => string
  utf8Decode: (str: string) => string
  md5: (str: string) => string
  hexEncode: (str: string) => string
  hexDecode: (str: string) => string
  sha1Encode: (str: string) => string
  uniEncode: (str: string) => string
  uniDecode: (str: string) => string
  utf8to16: (str: string) => string
  utf16to8: (str: string) => string
  html2js: (str: string) => string
  urlParamsDecode: (str: string) => { error?: string } | Record<string, any>
}

export default EncodeUtils
