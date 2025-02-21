<?php

use App\Http\Controllers\AllowanceController;
use Illuminate\Support\Facades\Route;

Route::get('/allowances', [AllowanceController::class, 'index']);
Route::post('/allowances', [AllowanceController::class, 'store']);
Route::get('/allowances/{allowance}', [AllowanceController::class, 'show']); // Optionnel
Route::put('/allowances/{allowance}', [AllowanceController::class, 'update']);
Route::delete('/allowances/{allowance}', [AllowanceController::class, 'destroy']);