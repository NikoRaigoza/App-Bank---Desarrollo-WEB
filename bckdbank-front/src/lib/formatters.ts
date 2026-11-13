const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export const shortDate = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatMoney(value: number) {
  return money.format(value)
}

export function formatMarketMoney(value: number, currency?: string) {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return formatMoney(value)
  }
}

const accountTypeLabels: Record<string, string> = {
  SAVINGS: 'Cuenta de ahorros',
  CHECKING: 'Cuenta corriente',
}

export function accountTypeLabel(type: string) {
  return accountTypeLabels[type] ?? type
}
