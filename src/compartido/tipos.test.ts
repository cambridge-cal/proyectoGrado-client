import { describe, expect, it } from 'vitest'
import { textoDias } from './tipos'

describe('textoDias', () => {
  it('resume los días de una franja', () => {
    expect(textoDias(['JUE', 'MAR', 'MIE'])).toBe('Mar a Jue')
    expect(textoDias(['LUN', 'MAR', 'MIE', 'JUE'])).toBe('Lun a Jue')
    expect(textoDias(['LUN', 'VIE'])).toBe('Lun y Vie')
    expect(textoDias(['LUN', 'MIE', 'VIE'])).toBe('Lun, Mié y Vie')
    expect(textoDias(['SAB'])).toBe('Sáb')
  })
})
