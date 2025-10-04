<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\CreateAppointmentReminders;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Agendamento automático de notificações
Schedule::command('notifications:process')->everyFiveMinutes();
Schedule::job(new CreateAppointmentReminders())->dailyAt('08:00');
Schedule::command('queue:work --tries=3 --timeout=60')->everyMinute()->withoutOverlapping();
