<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class WalletController extends Controller
{
    public function setConnected(Request $request)
    {
        Session::put('ethereum_connected', true);
        return response()->json(['success' => true]); 
    }

    public function unsetConnected(Request $request)
    {
        Session::forget('ethereum_connected');
        return response()->json(['success' => true]); 
    }
} 