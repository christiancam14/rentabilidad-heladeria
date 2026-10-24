<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categoria extends Model
{
    protected $fillable = [
        'nombre',
        'slug',
        'emoji',
        'orden',
        'visible',
    ];

    protected function casts(): array
    {
        return [
            'orden' => 'integer',
            'visible' => 'boolean',
        ];
    }

    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class)->orderBy('orden')->orderBy('nombre');
    }
}
