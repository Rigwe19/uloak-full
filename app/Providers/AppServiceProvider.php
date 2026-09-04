<?php

namespace App\Providers;

use App\Listeners\TrackMediaEvent;
use App\Models\Person;
use App\Policies\PersonPolicy;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
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

        $this->configureRateLimiting();
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

    protected function configureRateLimiting(): void
    {
        RateLimiter::for('guest-media', function (Request $request) {
            return Limit::perMinute(30)->by($request->ip())->response(function () {
                return response()->json(['message' => 'Too many uploads. Please slow down.'], 429);
            });
        });
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
