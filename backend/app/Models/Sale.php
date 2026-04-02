<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = ['sale_number', 'contact_id', 'sale_date', 'due_date', 'total_amount', 'paid_amount', 'status', 'payment_status', 'note'];

    protected $casts = [
        'sale_date' => 'datetime',
        'due_date' => 'datetime',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
    ];

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function items()
    {
        return $this->belongsToMany(Item::class, 'sale_items')->withPivot('quantity', 'unit_price', 'subtotal');
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }
}
