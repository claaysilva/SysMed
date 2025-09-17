<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->enum('tipo_consulta', ['consulta', 'retorno', 'emergencia', 'exame'])->default('consulta')->after('observacoes');
            $table->decimal('valor', 8, 2)->nullable()->after('tipo_consulta');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['tipo_consulta', 'valor']);
        });
    }
};
