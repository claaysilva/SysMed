<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NotificationService;

class ProcessNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:process';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process pending notifications queue';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando processamento de notificações...');

        $notificationService = app(NotificationService::class);
        $result = $notificationService->processQueue();

        $this->info("Processamento concluído!");
        $this->info("- Enviadas: {$result['sent']}");
        $this->info("- Falharam: {$result['failed']}");
        $this->info("- Total processadas: {$result['total']}");

        return 0;
    }
}
