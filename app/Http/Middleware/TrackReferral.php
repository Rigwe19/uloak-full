<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackReferral
{
    public function handle(Request $request, Closure $next): Response
    {
        $refCode = $request->query('ref');

        if (is_string($refCode) && $refCode !== '') {
            $refCode = trim($refCode);

            // Persist attribution in session (survives navigation + login) and cookie.
            $request->session()->put('referral_code', $refCode);

            // Capture UTM params alongside the ref for analytics.
            $utm = [];
            foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as $key) {
                $val = $request->query($key);
                if (is_string($val) && $val !== '') {
                    $utm[$key] = $val;
                }
            }
            if ($utm !== []) {
                $request->session()->put('utm', $utm);
            }

            /** @var Response $response */
            $response = $next($request);

            $days = (int) config('pricing.partner.attribution_cookie_days', 30);
            $response->headers->setCookie(
                cookie('ulo_ref', $refCode, $days * 24 * 60, null, null, false, false)
            );

            return $response;
        }

        // Also capture UTM even without a ref_code for campaign analytics.
        $utm = [];
        foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as $key) {
            $val = $request->query($key);
            if (is_string($val) && $val !== '') {
                $utm[$key] = $val;
            }
        }
        if ($utm !== []) {
            $request->session()->put('utm', $utm);
        }

        return $next($request);
    }
}
