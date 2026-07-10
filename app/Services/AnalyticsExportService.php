<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use League\Csv\Writer;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class AnalyticsExportService
{
    public function __construct(
        protected AnalyticsAggregationService $aggregation,
    ) {}

    public function csv(CarbonImmutable $start, CarbonImmutable $end, string $tab): string
    {
        $writer = Writer::createFromString();

        match ($tab) {
            'overview' => $this->writeOverviewCsv($writer, $start, $end),
            'media' => $this->writeMediaCsv($writer, $start, $end),
            'users' => $this->writeUsersCsv($writer, $start, $end),
            'processing' => $this->writeProcessingCsv($writer, $start, $end),
            default => throw new \InvalidArgumentException("Unknown tab: {$tab}"),
        };

        return $writer->toString();
    }

    public function xlsx(CarbonImmutable $start, CarbonImmutable $end, string $tab): string
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        match ($tab) {
            'overview' => $this->writeOverviewXlsx($sheet, $start, $end),
            'media' => $this->writeMediaXlsx($sheet, $start, $end),
            'users' => $this->writeUsersXlsx($sheet, $start, $end),
            'processing' => $this->writeProcessingXlsx($sheet, $start, $end),
            default => throw new \InvalidArgumentException("Unknown tab: {$tab}"),
        };

        $writer = new Xlsx($spreadsheet);
        $path = tempnam(sys_get_temp_dir(), 'analytics_').'.xlsx';
        $writer->save($path);

        return $path;
    }

    protected function writeOverviewCsv(Writer $writer, CarbonImmutable $start, CarbonImmutable $end): void
    {
        $stats = $this->aggregation->mediaStats($start, $end);

        $writer->insertOne(['Metric', 'Value']);
        $writer->insertOne(['Total Views', $stats['total_views']]);
        $writer->insertOne(['Unique Viewers', $stats['unique_viewers']]);
        $writer->insertOne(['Watch Time (s)', $stats['total_watch_time']]);
        $writer->insertOne(['Completion Rate (%)', $stats['completion_rate']]);
        $writer->insertOne(['Uploads', $stats['uploads']]);

        $writer->insertOne(['']);
        $writer->insertOne(['Date', 'Views', 'Uploads']);

        foreach ($stats['views_over_time'] as $date => $count) {
            $writer->insertOne([$date, $count, $stats['uploads_over_time'][$date] ?? 0]);
        }
    }

    protected function writeMediaCsv(Writer $writer, CarbonImmutable $start, CarbonImmutable $end): void
    {
        $stats = $this->aggregation->mediaStats($start, $end);

        $writer->insertOne(['Top Stories']);
        $writer->insertOne(['Story ID', 'Title', 'Views', 'Watch Time (s)']);

        foreach ($stats['top_stories'] as $story) {
            $writer->insertOne([$story['id'], $story['title'], $story['views'], $story['watch_time']]);
        }
    }

    protected function writeUsersCsv(Writer $writer, CarbonImmutable $start, CarbonImmutable $end): void
    {
        $stats = $this->aggregation->userStats($start, $end);

        $writer->insertOne(['Metric', 'Value']);
        $writer->insertOne(['New Users', $stats['new_users']]);
        $writer->insertOne(['Total Users', $stats['total_users']]);
        $writer->insertOne(['Active Users', $stats['active_users']]);
        $writer->insertOne(['Guest Viewers', $stats['guest_viewers']]);
        $writer->insertOne(['Sessions', $stats['sessions']]);

        $writer->insertOne(['']);
        $writer->insertOne(['Top Contributors']);
        $writer->insertOne(['User ID', 'Name', 'Stories']);

        foreach ($stats['top_contributors'] as $contributor) {
            $writer->insertOne([$contributor['id'], $contributor['name'], $contributor['stories']]);
        }
    }

    protected function writeProcessingCsv(Writer $writer, CarbonImmutable $start, CarbonImmutable $end): void
    {
        $stats = $this->aggregation->processingHealth($start, $end);

        $writer->insertOne(['Metric', 'Value']);
        $writer->insertOne(['Total Jobs', $stats['total_jobs']]);
        $writer->insertOne(['Successful', $stats['successful']]);
        $writer->insertOne(['Failed', $stats['failed']]);
        $writer->insertOne(['Success Rate (%)', $stats['success_rate']]);
        $writer->insertOne(['Avg Duration (ms)', $stats['avg_duration_ms'] ?? 'N/A']);

        $writer->insertOne(['']);
        $writer->insertOne(['Recent Failures']);
        $writer->insertOne(['ID', 'Media', 'Exception', 'Retries', 'Date']);

        foreach ($stats['recent_failures'] as $failure) {
            $writer->insertOne([
                $failure['id'],
                $failure['media_name'],
                $failure['exception'],
                $failure['retry_count'],
                $failure['created_at']->toDateTimeString(),
            ]);
        }
    }

    protected function writeOverviewXlsx($sheet, CarbonImmutable $start, CarbonImmutable $end): void
    {
        $stats = $this->aggregation->mediaStats($start, $end);

        $sheet->setCellValue('A1', 'Metric');
        $sheet->setCellValue('B1', 'Value');
        $sheet->setCellValue('A2', 'Total Views');
        $sheet->setCellValue('B2', $stats['total_views']);
        $sheet->setCellValue('A3', 'Unique Viewers');
        $sheet->setCellValue('B3', $stats['unique_viewers']);
        $sheet->setCellValue('A4', 'Watch Time (s)');
        $sheet->setCellValue('B4', $stats['total_watch_time']);
        $sheet->setCellValue('A5', 'Completion Rate (%)');
        $sheet->setCellValue('B5', $stats['completion_rate']);
        $sheet->setCellValue('A6', 'Uploads');
        $sheet->setCellValue('B6', $stats['uploads']);

        $sheet->setCellValue('A8', 'Date');
        $sheet->setCellValue('B8', 'Views');
        $sheet->setCellValue('C8', 'Uploads');

        $row = 9;
        foreach ($stats['views_over_time'] as $date => $count) {
            $sheet->setCellValue("A{$row}", $date);
            $sheet->setCellValue("B{$row}", $count);
            $sheet->setCellValue("C{$row}", $stats['uploads_over_time'][$date] ?? 0);
            $row++;
        }

        $sheet->getStyle('B2:B6')->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_NUMBER);
    }

    protected function writeMediaXlsx($sheet, CarbonImmutable $start, CarbonImmutable $end): void
    {
        $stats = $this->aggregation->mediaStats($start, $end);

        $sheet->setCellValue('A1', 'Top Stories');
        $sheet->setCellValue('A2', 'Story ID');
        $sheet->setCellValue('B2', 'Title');
        $sheet->setCellValue('C2', 'Views');
        $sheet->setCellValue('D2', 'Watch Time (s)');

        $row = 3;
        foreach ($stats['top_stories'] as $story) {
            $sheet->setCellValue("A{$row}", $story['id']);
            $sheet->setCellValue("B{$row}", $story['title']);
            $sheet->setCellValue("C{$row}", $story['views']);
            $sheet->setCellValue("D{$row}", $story['watch_time']);
            $row++;
        }
    }

    protected function writeUsersXlsx($sheet, CarbonImmutable $start, CarbonImmutable $end): void
    {
        $stats = $this->aggregation->userStats($start, $end);

        $sheet->setCellValue('A1', 'Metric');
        $sheet->setCellValue('B1', 'Value');
        $sheet->setCellValue('A2', 'New Users');
        $sheet->setCellValue('B2', $stats['new_users']);
        $sheet->setCellValue('A3', 'Total Users');
        $sheet->setCellValue('B3', $stats['total_users']);
        $sheet->setCellValue('A4', 'Active Users');
        $sheet->setCellValue('B4', $stats['active_users']);
        $sheet->setCellValue('A5', 'Guest Viewers');
        $sheet->setCellValue('B5', $stats['guest_viewers']);
        $sheet->setCellValue('A6', 'Sessions');
        $sheet->setCellValue('B6', $stats['sessions']);

        $sheet->setCellValue('A8', 'Top Contributors');
        $sheet->setCellValue('A9', 'User ID');
        $sheet->setCellValue('B9', 'Name');
        $sheet->setCellValue('C9', 'Stories');

        $row = 10;
        foreach ($stats['top_contributors'] as $contributor) {
            $sheet->setCellValue("A{$row}", $contributor['id']);
            $sheet->setCellValue("B{$row}", $contributor['name']);
            $sheet->setCellValue("C{$row}", $contributor['stories']);
            $row++;
        }
    }

    protected function writeProcessingXlsx($sheet, CarbonImmutable $start, CarbonImmutable $end): void
    {
        $stats = $this->aggregation->processingHealth($start, $end);

        $sheet->setCellValue('A1', 'Metric');
        $sheet->setCellValue('B1', 'Value');
        $sheet->setCellValue('A2', 'Total Jobs');
        $sheet->setCellValue('B2', $stats['total_jobs']);
        $sheet->setCellValue('A3', 'Successful');
        $sheet->setCellValue('B3', $stats['successful']);
        $sheet->setCellValue('A4', 'Failed');
        $sheet->setCellValue('B4', $stats['failed']);
        $sheet->setCellValue('A5', 'Success Rate (%)');
        $sheet->setCellValue('B5', $stats['success_rate']);
        $sheet->setCellValue('A6', 'Avg Duration (ms)');
        $sheet->setCellValue('B6', $stats['avg_duration_ms'] ?? 'N/A');

        $sheet->setCellValue('A8', 'Recent Failures');
        $sheet->setCellValue('A9', 'ID');
        $sheet->setCellValue('B9', 'Media');
        $sheet->setCellValue('C9', 'Exception');
        $sheet->setCellValue('D9', 'Retries');
        $sheet->setCellValue('E9', 'Date');

        $row = 10;
        foreach ($stats['recent_failures'] as $failure) {
            $sheet->setCellValue("A{$row}", $failure['id']);
            $sheet->setCellValue("B{$row}", $failure['media_name']);
            $sheet->setCellValue("C{$row}", $failure['exception']);
            $sheet->setCellValue("D{$row}", $failure['retry_count']);
            $sheet->setCellValue("E{$row}", $failure['created_at']->toDateTimeString());
            $row++;
        }
    }
}
