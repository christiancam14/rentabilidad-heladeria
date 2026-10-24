<?php

use App\Models\Sede;

it('returns a successful response', function () {
    Sede::create(['nombre' => 'Provenza', 'slug' => 'provenza']);

    $response = $this->get('/');

    $response->assertStatus(200);
});
