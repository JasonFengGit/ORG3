import { toUtf8Bytes } from '@ethersproject/strings/lib/utf8'

export function formatUsd(number) {
  return number.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })
}

export const shortenAddress = (address = '', maxLength = 10, leftSlice = 5, rightSlice = 5) => {
  if (address.length < maxLength) {
    return address
  }

  return `${address.slice(0, leftSlice)}...${address.slice(-rightSlice)}`
}

export const secondsToDays = (seconds: number) => Math.floor(seconds / (60 * 60 * 24))

export const secondsToHours = (seconds: number) => Math.floor(seconds / (60 * 60))

export const daysToSeconds = (days: number) => days * 60 * 60 * 24

export const yearsToSeconds = (years: number) => years * 60 * 60 * 24 * 365

export const secondsToYears = (seconds: number) => seconds / (60 * 60 * 24 * 365)

export const formatExpiry = (expiry: Date) => `
${expiry.toLocaleDateString(undefined, {
  month: 'long',
})} ${expiry.getDate()}, ${expiry.getFullYear()}`

export const formatDateTime = (date: Date) => {
  const baseFormatted = date.toLocaleTimeString('en', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    timeZoneName: 'short',
  })
  return `${baseFormatted}`
}

export const formatFullExpiry = (expiryDate?: Date) =>
  expiryDate ? `${formatExpiry(expiryDate)}, ${formatDateTime(expiryDate)}` : ''


export const checkDNSName = (name: string): boolean => {
  const labels = name?.split('.')

  return !!labels && labels[labels.length - 1] !== 'eth'
}

export const checkETHName = (labels: string[]) => labels[labels.length - 1] === 'eth'

export const checkETH2LDName = (isDotETH: boolean, labels: string[], canBeShort?: boolean) =>
  isDotETH && labels.length === 2 && (canBeShort || labels[0].length >= 3)

export const checkETH2LDFromName = (name: string) => {
  const labels = name.split('.')
  return checkETH2LDName(checkETHName(labels), labels, true)
}

export const checkSubname = (name: string) => name.split('.').length > 2;

export const validateExpiry = (
  name: string,
  fuses: any,
  expiry: Date | undefined,
  pccExpired?: boolean,
) => {
  const isDotETH = checkETH2LDFromName(name)
  if (isDotETH) return expiry
  if (!fuses) return undefined
  return pccExpired || fuses.parent.PARENT_CANNOT_CONTROL ? expiry : undefined
}
