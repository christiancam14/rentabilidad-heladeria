<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AgregarProductoCierreRequest extends FormRequest
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
            'producto_id' => ['required', 'exists:productos,id'],
            'cantidad_vendida' => ['required', 'integer', 'min:0'],
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
            'producto_id.required' => 'Debe seleccionar un producto.',
            'producto_id.exists' => 'El producto seleccionado no existe.',
            'cantidad_vendida.required' => 'La cantidad vendida es obligatoria.',
            'cantidad_vendida.integer' => 'La cantidad vendida debe ser un número entero válido.',
            'cantidad_vendida.min' => 'La cantidad vendida no puede ser negativa.',
        ];
    }
}
