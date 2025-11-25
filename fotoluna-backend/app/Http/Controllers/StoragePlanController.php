<?php

namespace App\Http\Controllers;

use App\Models\StoragePlan;
use Illuminate\Http\Request;

class StoragePlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return StoragePlan::where('is_active', true)->get();
    }
}
