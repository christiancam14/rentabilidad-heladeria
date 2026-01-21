<?php

namespace App\Http\Requests;

use App\Models\Insumo;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInsumoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'precio' => ['required', 'integer', 'min:0'],
            'unidad' => ['required', 'string', Rule::in(Insumo::unidadesDisponibles())],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del insumo es obligatorio.',
            'precio.required' => 'El precio del insumo es obligatorio.',
            'precio.integer' => 'El precio debe ser un número entero válido.',
            'precio.min' => 'El precio no puede ser negativo.',
            'unidad.required' => 'La unidad es obligatoria.',
            'unidad.in' => 'La unidad seleccionada no es válida.',
        ];
    }
}
