<?php

namespace App\Providers;

use App\Listeners\TrackMediaEvent;
use App\Models\Person;
use App\Policies\PersonPolicy;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use SocialiteProviders\Apple\AppleExtendSocialite;
use SocialiteProviders\Manager\SocialiteWasCalled;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        Gate::policy(Person::class, PersonPolicy::class);

        $this->configureSubscribers();

        $this->configureSocialite();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureSubscribers(): void
    {
        Event::subscribe(TrackMediaEvent::class);
    }

    /**
     * Configure Socialite providers.
     */
    protected function configureSocialite(): void
    {
        Event::listen(
            SocialiteWasCalled::class,
            AppleExtendSocialite::class.'@handle',
        );
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(8)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->uncompromised()
            : null,
        );
    }
}
