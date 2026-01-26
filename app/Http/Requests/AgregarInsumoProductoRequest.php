<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AgregarInsumoProductoRequest extends FormRequest
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
            'insumo_id' => ['sometimes', 'required', 'exists:insumos,id'],
            'cantidad_preparacion' => ['required', 'numeric', 'min:0'],
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
            'insumo_id.required' => 'Debe seleccionar un insumo.',
            'insumo_id.exists' => 'El insumo seleccionado no existe.',
            'cantidad_preparacion.required' => 'La cantidad de preparación es obligatoria.',
            'cantidad_preparacion.numeric' => 'La cantidad de preparación debe ser un número válido.',
            'cantidad_preparacion.min' => 'La cantidad de preparación no puede ser negativa.',
        ];
    }
}
