<?php

namespace App\Http\Controllers;

use App\Models\Allowance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class AllowanceController extends Controller
{
    public function index()
    {
        $allowances = Allowance::all();
        return Inertia::render('Dashboard', [
            'allowances' => $allowances,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'contract_address' => ['required', 'string'],
            'owner_address' => ['required', 'string'],
            'spender_address' => ['required', 'string'],
            'amount' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $allowance = Allowance::create($request->all());
        return redirect()->back()->with('success', 'Autorisation ajoutée avec succès.');
    }

    public function show(Allowance $allowance)
    {
        return Inertia::render('Allowance/Show', [
            'allowance' => $allowance,
        ]);
    }

    public function update(Request $request, Allowance $allowance)
    {
        $validator = Validator::make($request->all(), [
            'contract_address' => ['sometimes', 'required', 'string'],
            'owner_address' => ['sometimes', 'required', 'string'],
            'spender_address' => ['sometimes', 'required', 'string'],
            'amount' => ['sometimes', 'required', 'string'],
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $allowance->update($request->all());
        return redirect()->back()->with('success', 'Autorisation mise à jour avec succès.');
    }

    public function destroy(Allowance $allowance)
    {
        $allowance->delete();
        return redirect()->back()->with('success', 'Autorisation supprimée avec succès.');
    }
}