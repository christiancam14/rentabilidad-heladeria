// Función helper para formatear número con separadores de miles (puntos)
export const formatNumberWithSeparator = (value: string | number): string => {
    if (!value && value !== 0) return '';
    const numValue = typeof value === 'string' ? value.replace(/\./g, '') : String(value);
    const num = parseInt(numValue, 10);
    if (isNaN(num)) return '';
    return num.toLocaleString('es-ES');
};

// Función helper para limpiar formato y obtener solo el número
export const cleanNumberFormat = (value: string): string => {
    return value.replace(/\./g, '');
};

// Función helper para manejar el onChange de inputs numéricos con formato
export const handleNumberInputChange = (
    value: string,
    setValue: (value: string) => void
): void => {
    // Permitir solo números y puntos (para formato)
    const inputValue = value.replace(/[^\d.]/g, '');
    // Formatear con separadores de miles
    const cleaned = cleanNumberFormat(inputValue);
    if (cleaned === '' || !isNaN(Number(cleaned))) {
        setValue(cleaned === '' ? '' : formatNumberWithSeparator(cleaned));
    }
};

// Función helper para manejar el onBlur de inputs numéricos con formato
export const handleNumberInputBlur = (
    value: string,
    setValue: (value: string) => void
): void => {
    const cleaned = cleanNumberFormat(value);
    if (cleaned !== '') {
        setValue(formatNumberWithSeparator(cleaned));
    }
};
