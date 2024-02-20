import Context from './context.ts';
import Plugin from './plugin.ts';

/*
https://infosec.mozilla.org/guidelines/web_security
https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
*/

/**
 * ## Headers
 * ```
 * content-security-policy: default-src 'self'; upgrade-insecure-requests;
 * cross-origin-embedder-policy: require-corp
 * cross-origin-resource-policy: same-origin
 * cross-origin-opener-policy: same-origin
 * origin-agent-cluster: ?1
 * referrer-policy: no-referrer
 * strict-transport-security: max-age=63072000; includeSubDomains; preload
 * x-content-type-options: nosniff
 * x-dns-prefetch-control: off
 * x-download-options: noopen
 * x-frame-options: deny
 * x-permitted-cross-domain-policies: none
 * x-xss-protection: 1; mode=block
 * ```
 */

type CrossOriginEmbedderPolicy = '' | 'unsafe-none' | 'require-corp' | 'credentialless';
type CrossOriginResourcePolicy = '' | 'same-site' | 'same-origin' | 'cross-origin';
type CrossOriginOpenerPolicy = '' | 'unsafe-none' | 'same-origin-allow-popups' | 'same-origin';

export default class Defenders extends Plugin {
    #contentSecurityPolicyDefaultSrc = `'self'`;
    contentSecurityPolicyDefaultSrc(data: string): this {
        this.#contentSecurityPolicyDefaultSrc = data;
        return this;
    }

    #contentSecurityPolicyBaseUri = ``;
    contentSecurityPolicyBaseUri(data: string): this {
        this.#contentSecurityPolicyBaseUri = data;
        return this;
    }

    #contentSecurityPolicyChildSrc = ``;
    contentSecurityPolicyChildSrc(data: string): this {
        this.#contentSecurityPolicyChildSrc = data;
        return this;
    }

    #contentSecurityPolicyConnectSrc = ``;
    contentSecurityPolicyConnectSrc(data: string): this{
        this.#contentSecurityPolicyConnectSrc = data;
        return this;
    }

    #contentSecurityPolicyFontSrc = ``;
    contentSecurityPolicyFontSrc(data: string): this{
        this.#contentSecurityPolicyFontSrc = data;
        return this;
    }

    #contentSecurityPolicyFormAction = ``;
    contentSecurityPolicyFormSrc(data: string): this{
        this.#contentSecurityPolicyFormAction = data;
        return this;
    }

    #contentSecurityPolicyFrameAncestors = ``;
    contentSecurityPolicyFrameAncestors(data: string): this{
        this.#contentSecurityPolicyFrameAncestors = data;
        return this;
    }

    #contentSecurityPolicyFrameSrc = ``;
    contentSecurityPolicyFrameSrc(data: string): this{
        this.#contentSecurityPolicyFrameSrc = data;
        return this;
    }

    #contentSecurityPolicyImgSrc = ``;
    contentSecurityPolicyImgSrc(data: string): this{
        this.#contentSecurityPolicyImgSrc = data;
        return this;
    }

    #contentSecurityPolicyManifestSrc = ``;
    contentSecurityPolicyManifestSrc(data: string): this{
        this.#contentSecurityPolicyManifestSrc = data;
        return this;
    }

    #contentSecurityPolicyMediaSrc = ``;
    contentSecurityPolicyMediaSrc(data: string): this{
        this.#contentSecurityPolicyMediaSrc = data;
        return this;
    }

    #contentSecurityPolicyObjectSrc = ``;
    contentSecurityPolicyObjectSrc(data: string): this{
        this.#contentSecurityPolicyObjectSrc = data;
        return this;
    }

    #contentSecurityPolicyPrefetchSrc = ``;
    contentSecurityPolicyPrefetchSrc(data: string): this{
        this.#contentSecurityPolicyPrefetchSrc = data;
        return this;
    }

    #contentSecurityPolicyStyleSrc = ``;
    contentSecurityPolicyStyleSrc(data: string): this{
        this.#contentSecurityPolicyStyleSrc = data;
        return this;
    }

    #contentSecurityPolicyStyleSrcAttr = ``;
    contentSecurityPolicyStyleSrcAttr(data: string): this{
        this.#contentSecurityPolicyStyleSrcAttr = data;
        return this;
    }

    #contentSecurityPolicyStyleSrcElem = ``;
    contentSecurityPolicyStyleSrcElem(data: string): this{
        this.#contentSecurityPolicyStyleSrcElem = data;
        return this;
    }

    #contentSecurityPolicyScriptSrc = ``;
    contentSecurityPolicyScriptSrc(data: string): this{
        this.#contentSecurityPolicyScriptSrc = data;
        return this;
    }

    #contentSecurityPolicyScriptSrcAttr = ``;
    contentSecurityPolicyScriptSrcAttr(data: string): this{
        this.#contentSecurityPolicyScriptSrcAttr = data;
        return this;
    }

    #contentSecurityPolicyScriptSrcElem = ``;
    contentSecurityPolicyScriptSrcElem(data: string): this{
        this.#contentSecurityPolicyScriptSrcElem = data;
        return this;
    }

    #contentSecurityPolicyWorkerSrc = ``;
    contentSecurityPolicyWorkerSrc(data: string): this{
        this.#contentSecurityPolicyWorkerSrc = data;
        return this;
    }

    #contentSecurityPolicyTrustedTypes = ``;
    contentSecurityPolicyTrustedTypes(data: string): this{
        this.#contentSecurityPolicyTrustedTypes = data;
        return this;
    }

    #contentSecurityPolicyRequireTrustedTypesFor = ``;
    contentSecurityPolicyRequireTrustedTypesFor(data: string): this{
        this.#contentSecurityPolicyRequireTrustedTypesFor = data;
        return this;
    }

    #contentSecurityPolicyUpgradeInsecureRequests = `upgrade-insecure-requests`;
    contentSecurityPolicyUpgradeInsecureRequests(data: string): this{
        this.#contentSecurityPolicyUpgradeInsecureRequests = data;
        return this;
    }

    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy
    #crossOriginEmbedderPolicy: CrossOriginEmbedderPolicy = 'require-corp';
    crossOriginEmbedderPolicy(data: CrossOriginEmbedderPolicy): this{
        this.#crossOriginEmbedderPolicy = data;
        return this;
    }

    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Cross-Origin_Resource_Policy
    #crossOriginResourcePolicy: CrossOriginResourcePolicy = 'same-origin';
    crossOriginResourcePolicy(data: CrossOriginResourcePolicy): this{
        this.#crossOriginResourcePolicy = data;
        return this;
    }

    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy
    #crossOriginOpenerPolicy: CrossOriginOpenerPolicy = 'same-origin';
    crossOriginOpenerPolicy(data: CrossOriginOpenerPolicy): this{
        this.#crossOriginOpenerPolicy = data;
        return this;
    }

    #originAgentCluster = '?1';
    originAgentCluster(data: string): this{
        this.#originAgentCluster = data;
        return this;
    }

    #referrerPolicy = 'no-referrer';
    referrerPolicy(data: string): this{
        this.#referrerPolicy = data;
        return this;
    }

    #strictTransportSecurity = 'max-age=63072000; includeSubDomains; preload';
    strictTransportSecurity(data: string): this{
        this.#strictTransportSecurity = data;
        return this;
    }

    #xContentTypeOptions = 'nosniff';
    xContentTypeOptions(data: string): this{
        this.#xContentTypeOptions = data;
        return this;
    }

    #xDnsPrefetchControl = 'off';
    xDnsPrefetchControl(data: string): this{
        this.#xDnsPrefetchControl = data;
        return this;
    }

    #xDownloadOptions = 'noopen';
    xDownloadOptions(data: string): this{
        this.#xDownloadOptions = data;
        return this;
    }

    #xFrameOptions = 'deny';
    xFrameOptions(data: string): this{
        this.#xFrameOptions = data;
        return this;
    }

    #xPermittedCrossDomainPolicies = 'none';
    xPermittedCrossDomainPolicies(data: string): this{
        this.#xPermittedCrossDomainPolicies = data;
        return this;
    }

    #xXssProtection = '1; mode=block';
    xXssProtection(data: string): this{
        this.#xXssProtection = data;
        return this;
    }

    handle(context: Context): Response | void {
        if (
            this.#contentSecurityPolicyDefaultSrc ||
            this.#contentSecurityPolicyBaseUri ||
            this.#contentSecurityPolicyChildSrc ||
            this.#contentSecurityPolicyConnectSrc ||
            this.#contentSecurityPolicyFontSrc ||
            this.#contentSecurityPolicyFormAction ||
            this.#contentSecurityPolicyFrameAncestors ||
            this.#contentSecurityPolicyFrameSrc ||
            this.#contentSecurityPolicyImgSrc ||
            this.#contentSecurityPolicyManifestSrc ||
            this.#contentSecurityPolicyMediaSrc ||
            this.#contentSecurityPolicyObjectSrc ||
            this.#contentSecurityPolicyPrefetchSrc ||
            this.#contentSecurityPolicyStyleSrc ||
            this.#contentSecurityPolicyStyleSrcAttr ||
            this.#contentSecurityPolicyStyleSrcElem ||
            this.#contentSecurityPolicyScriptSrc ||
            this.#contentSecurityPolicyScriptSrcAttr ||
            this.#contentSecurityPolicyScriptSrcElem ||
            this.#contentSecurityPolicyWorkerSrc ||
            this.#contentSecurityPolicyTrustedTypes ||
            this.#contentSecurityPolicyRequireTrustedTypesFor ||
            this.#contentSecurityPolicyUpgradeInsecureRequests
        ) {
            const data = [];

            if (this.#contentSecurityPolicyDefaultSrc) data.push(`default-src ${this.#contentSecurityPolicyDefaultSrc}`);
            if (this.#contentSecurityPolicyBaseUri) data.push(`base-uri ${this.#contentSecurityPolicyBaseUri}`);
            if (this.#contentSecurityPolicyChildSrc) data.push(`child-src ${this.#contentSecurityPolicyChildSrc}`);
            if (this.#contentSecurityPolicyConnectSrc) data.push(`connect-src ${this.#contentSecurityPolicyConnectSrc}`);
            if (this.#contentSecurityPolicyFontSrc) data.push(`font-src ${this.#contentSecurityPolicyFontSrc}`);
            if (this.#contentSecurityPolicyFormAction) data.push(`form-action ${this.#contentSecurityPolicyFormAction}`);

            if (this.#contentSecurityPolicyFrameAncestors) data.push(`frame-ancestors ${this.#contentSecurityPolicyFrameAncestors}`);
            if (this.#contentSecurityPolicyFrameSrc) data.push(`frame-src ${this.#contentSecurityPolicyFrameSrc}`);

            if (this.#contentSecurityPolicyImgSrc) data.push(`img-src ${this.#contentSecurityPolicyImgSrc}`);
            if (this.#contentSecurityPolicyManifestSrc) data.push(`manifest-src ${this.#contentSecurityPolicyManifestSrc}`);
            if (this.#contentSecurityPolicyMediaSrc) data.push(`media-src ${this.#contentSecurityPolicyMediaSrc}`);
            if (this.#contentSecurityPolicyObjectSrc) data.push(`object-src ${this.#contentSecurityPolicyObjectSrc}`);
            if (this.#contentSecurityPolicyPrefetchSrc) data.push(`prefetch-src ${this.#contentSecurityPolicyPrefetchSrc}`);

            if (this.#contentSecurityPolicyStyleSrc) data.push(`style-src ${this.#contentSecurityPolicyStyleSrc}`);
            if (this.#contentSecurityPolicyStyleSrcAttr) data.push(`style-src-attr ${this.#contentSecurityPolicyStyleSrcAttr}`);
            if (this.#contentSecurityPolicyStyleSrcElem) data.push(`style-src-elem ${this.#contentSecurityPolicyStyleSrcElem}`);

            if (this.#contentSecurityPolicyScriptSrc) data.push(`script-src ${this.#contentSecurityPolicyScriptSrc}`);
            if (this.#contentSecurityPolicyScriptSrcAttr) data.push(`script-src-attr ${this.#contentSecurityPolicyScriptSrcAttr}`);
            if (this.#contentSecurityPolicyScriptSrcElem) data.push(`script-src-elem ${this.#contentSecurityPolicyScriptSrcElem}`);

            if (this.#contentSecurityPolicyWorkerSrc) data.push(`worker-src ${this.#contentSecurityPolicyWorkerSrc}`);

            if (this.#contentSecurityPolicyTrustedTypes) data.push(`trusted-types ${this.#contentSecurityPolicyTrustedTypes}`);
            if (this.#contentSecurityPolicyRequireTrustedTypesFor) data.push(`require-trusted-types-for ${this.#contentSecurityPolicyRequireTrustedTypesFor}`);

            if (this.#contentSecurityPolicyUpgradeInsecureRequests) data.push(`${this.#contentSecurityPolicyUpgradeInsecureRequests}`);

            context.headers.set('content-security-policy', data.join(';'));
        }

        if (this.#crossOriginEmbedderPolicy) context.headers.set('cross-origin-embedder-policy', this.#crossOriginEmbedderPolicy);

        if (this.#crossOriginOpenerPolicy) context.headers.set('cross-origin-opener-policy', this.#crossOriginOpenerPolicy);

        if (this.#crossOriginResourcePolicy) context.headers.set('cross-origin-resource-policy', this.#crossOriginResourcePolicy);

        if (this.#originAgentCluster) context.headers.set('origin-agent-cluster', this.#originAgentCluster);

        if (this.#referrerPolicy) context.headers.set('referrer-policy', this.#referrerPolicy);

        if (this.#strictTransportSecurity) context.headers.set('strict-transport-security', this.#strictTransportSecurity);

        if (this.#xDnsPrefetchControl) context.headers.set('x-dns-prefetch-control', this.#xDnsPrefetchControl);

        if (this.#xDownloadOptions) context.headers.set('x-download-options', this.#xDownloadOptions);

        if (this.#xPermittedCrossDomainPolicies) context.headers.set('x-permitted-cross-domain-policies', this.#xPermittedCrossDomainPolicies);

        if (this.#xContentTypeOptions) context.headers.set('x-content-type-options', this.#xContentTypeOptions);

        if (this.#xFrameOptions) context.headers.set('x-frame-options', this.#xFrameOptions);

        if (this.#xXssProtection) context.headers.set('x-xss-protection', this.#xXssProtection);
    }
}
