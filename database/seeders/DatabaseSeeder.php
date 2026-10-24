<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::updateOrCreate(
            ['email' => 'heladeriaatugusto@gmail.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('1099202734'),
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            FinanzasSeeder::class,
            InsumoSeeder::class,
            MenuSeeder::class,
        ]);
    }
}
