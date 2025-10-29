import { describe, it, vi, beforeEach, expect } from 'vitest'
import { notifySuccess, notifyError, notifyInfo } from '../../src/utils/notify'

// 🔹 Mock de notistack en entorno ESM:
vi.mock('notistack', () => {
  return {
    enqueueSnackbar: vi.fn(),
  }
})

// Importamos el mock para poder verificar llamadas
import { enqueueSnackbar } from 'notistack'

describe('notify utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería mostrar un mensaje de éxito', () => {
    notifySuccess('Operación exitosa ✅')
    expect(enqueueSnackbar).toHaveBeenCalledWith('Operación exitosa ✅', { variant: 'success' })
  })

  it('debería mostrar un mensaje de error', () => {
    notifyError('Hubo un error ❌')
    expect(enqueueSnackbar).toHaveBeenCalledWith('Hubo un error ❌', { variant: 'error' })
  })

  it('debería mostrar un mensaje informativo', () => {
    notifyInfo('Información general ℹ️')
    expect(enqueueSnackbar).toHaveBeenCalledWith('Información general ℹ️', { variant: 'info' })
  })
})
