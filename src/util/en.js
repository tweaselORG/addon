export const translations = {
    "properties": {
        "accelerometerX": "Accelerometer X",
        "accelerometerY": "Accelerometer Y",
        "accelerometerZ": "Accelerometer Z",
        "appId": "App ID",
        "appName": "App name",
        "appVersion": "App version",
        "architecture": "Architecture",
        "batteryLevel": "Battery level",
        "carrier": "Carrier",
        "country": "Country",
        "deviceName": "Device name",
        "diskFree": "Free disk space",
        "diskTotal": "Total disk space",
        "diskUsed": "Used disk space",
        "hashedIdfa": "Hashed device advertising ID",
        "idfa": "Device advertising ID (GAID/IDFA)",
        "idfv": "Developer-scoped device ID (IDFV/ASID/ANDROID_ID)",
        "installTime": "App install time",
        "isCharging": "Charging status",
        "isEmulator": "Is device an emulator?",
        "isFirstLaunch": "Is first launch?",
        "isInDarkMode": "Is app in dark mode?",
        "isInForeground": "Is app in foreground?",
        "isRoaming": "Is device roaming?",
        "isRooted": "Is device rooted?",
        "language": "Language",
        "latitude": "Latitude",
        "localIp": "Local IP address(es)",
        "longitude": "Longitude",
        "macAddress": "MAC address",
        "manufacturer": "Manufacturer",
        "model": "Model",
        "networkConnectionType": "Network connection type",
        "orientation": "Orientation",
        "osName": "OS name",
        "osVersion": "OS version",
        "otherIdentifiers": "Other unique identifiers for the user, device, session, or installation",
        "publicIp": "Public IP address",
        "pushNotificationToken": "Push notification token",
        "ramFree": "Free RAM",
        "ramTotal": "Total RAM",
        "ramUsed": "Used RAM",
        "referer": "Referer",
        "revenue": "Earned revenue",
        "rotationX": "Rotation X",
        "rotationY": "Rotation Y",
        "rotationZ": "Rotation Z",
        "screenHeight": "Screen height",
        "screenWidth": "Screen width",
        "signalStrengthCellular": "Signal strength (cellular)",
        "signalStrengthWifi": "Signal strength (Wi-Fi)",
        "startTime": "App start time",
        "state": "State/Sub national entity",
        "timeSpent": "Time spent in app",
        "timezone": "Time zone",
        "trackerSdkVersion": "Tracker SDK version",
        "uptime": "Uptime",
        "userAgent": "User agent",
        "viewedPage": "Viewed page",
        "volume": "Volume"
    },
    "tracker-descriptions": {
        "adjust": "Adjust offers the following services:\n\n- User engagement tracking using events. “You can define in-app events for your app to measure user registrations, add-to-carts, or level ups, while setting up revenue events lets you record in-app purchases and transactions. Set up events to: See where your users go directly after install, Discover the app features your users like the most, Identify the last thing a user does before they become inactive”&nbsp;{{< reference url=\"https://help.adjust.com/en/article/add-events\" >}}\n- Mobile attribution, in order to “[i]dentify [the] best users and channels”.&nbsp;{{< reference url=\"https://www.adjust.com/product/mobile-app-attribution/\" >}} “Adjust's attribution matches your app users to the source that drove their install. You can use this attribution data to measure campaign performance, run effective retargeting campaigns, optimize your creative assets, and more.”&nbsp;{{< reference url=\"https://help.adjust.com/en/article/attribution-methods\" >}} Additionally, “Adjust can reattribute dormant users who engage with a new source and then return to [the] app.”&nbsp;{{< reference url=\"https://help.adjust.com/en/article/reattribution\" >}}\n\n  Adjust uses two attribution methods:\n    - “Deterministic attribution is Adjust's main attribution method and involves device matching. We collect a unique identifier from recorded engagements and installs, and if both IDs match, we can attribute that engagement to the install. With a 100% accuracy rate, click-based device matching is the most reliable attribution method. We use deterministic attribution to attribute installs (first app opens) and reattribute (assign new attribution sources to) inactive users. Adjust uses the following identifiers for deterministic attribution: Advertising IDs […], Device IDs […], Adjust reftags […]”&nbsp;{{< reference url=\"https://help.adjust.com/en/article/attribution-methods#deterministic-attribution\" >}}\n    - “Probabilistic modeling […] uses machine learning to support a statistical approach to measurement.”&nbsp;{{< reference url=\"https://help.adjust.com/en/article/attribution-methods#probabilistic-modeling\" >}}\n- Uninstall and reinstall tracking. “When a user installs [the] app, the app is given a unique push token which the Adjust SDK forwards to Adjust's servers. Silent push notifications are then sent once per day to check if the app is still installed.”&nbsp;{{< reference url=\"https://help.adjust.com/en/article/uninstalls-reinstalls\" >}}\n- Audience segmentation to “group users together based on […] criteria”.&nbsp;{{< reference url=\"https://www.adjust.com/product/audience-builder/\" >}}\n- Fraud prevention. “Organic users are captured accurately and not misattributed”.&nbsp;{{< reference url=\"https://www.adjust.com/product/fraud-prevention/\" >}}\n\nAdditionally, Adjust can pull in tracking data from partner companies.&nbsp;{{< reference url=\"https://help.adjust.com/en/article/partner-connections\" >}}",
        "branch-io": "Branch offers the following services:\n\n- Mobile attribution&nbsp;{{< reference url=\"https://www.branch.io/attribution/\" >}} to “[c]apture every customer touchpoint across any channel, platform, OS to optimize […] campaigns and maximize ROI.”&nbsp;{{< reference url=\"https://www.branch.io/features/\" >}}\n- Ad conversion tracking. Branch can “[r]etarget app users who see a web ad and then purchase in the app, attribute revenue to the web ad that drove the install, and measure cumulative revenue from users across both web and app.”&nbsp;{{< reference url=\"https://www.branch.io/universal-ads/\" >}}\n- Custom audiences to “communicate the perfect message to the ideal customer, at the right moment”. “Get higher return on ad spend (ROAS) with precision retargeting of high-value active users and eliminate wasted spend in your acquisition campaigns by excluding existing customers. Re-engage lapsed users, boost propensity to purchase, and increase sessions per user.”&nbsp;{{< reference url=\"https://www.branch.io/engagement-builder/\" >}}\n- Fraud protection.&nbsp;{{< reference url=\"https://www.branch.io/fraud-protection/\" >}}\n\nBranch provides integrations to automatically “send Branch data to […] marketing and analytics partners to measure and optimize […] campaigns.”&nbsp;{{< reference url=\"https://www.branch.io/data-feeds/\" >}}",
        "branch-io-attribution-api": "The Branch Attribution API is used for “deep linking and session attribution. […] Every time the API is called, it will track an INSTALL, REINSTALL, or OPEN event in Branch and return deep link data in the response if the session is attributed.”&nbsp;{{< reference url=\"https://help.branch.io/developers-hub/reference/attribution-api\" >}} It can also track “additional downstream conversion events” like PURCHASE.&nbsp;{{< reference url=\"https://help.branch.io/developers-hub/reference/attribution-api#tracking-downstream-events\" >}}",
        "chartboost": "Chartboost is an advertising platform focused on mobile gaming that caters to both publishers&nbsp;{{< reference url=\"https://www.chartboost.com/products/monetization/\" >}} and advertisers&nbsp;{{< reference url=\"https://www.chartboost.com/products/advertising/\" >}}.\n\nChartboost supports mediation (real-time bidding)&nbsp;{{< reference url=\"https://www.chartboost.com/products/mediation/\" >}}, analytics&nbsp;{{< reference url=\"https://docs.chartboost.com/en/mediation/analytics/\" >}}, and A/B testing&nbsp;{{< reference url=\"https://docs.chartboost.com/en/mediation/ab-tests/\" >}}.",
        "google-fundingchoices": "With Google's Privacy & Messaging API (formerly Funding Choices&nbsp;{{< reference url=\"https://support.google.com/fundingchoices/answer/9010669?hl=en\" >}}), app developers can manage users' consent choices&nbsp;{{< reference url=\"https://developers.google.com/funding-choices\" >}} and show consent forms&nbsp;{{< reference url=\"https://developers.google.com/admob/android/privacy#load-and-show-form\" >}}. It can also be used to detect ad blockers and display messages to “recover lost revenue from ad blocking users”.&nbsp;{{< reference url=\"https://support.google.com/admob/answer/10107561\" >}}\n\nThe Privacy & Messaging API is available through Google's AdMob, Ad Manager, and AdSense SDKs on the web, Android, and iOS.&nbsp;{{< reference url=\"https://support.google.com/fundingchoices/answer/9010669?hl=en\" >}}",
        "facebook-audience-network": "Meta Audience Network is a service by Facebook that allows app developers to monetize their apps with ads.&nbsp;{{< reference url=\"https://developers.facebook.com/docs/audience-network\" >}} Facebook offers Audience Network SDKs for Android&nbsp;{{< reference url=\"https://developers.facebook.com/docs/audience-network/setting-up/platform-setup/android/add-sdk\" >}}, iOS&nbsp;{{< reference url=\"https://developers.facebook.com/docs/audience-network/setting-up/platform-setup/ios/add-sdk\" >}}, and Unity&nbsp;{{< reference url=\"https://developers.facebook.com/docs/audience-network/setting-up/platform-steup/unity/add-sdk\" >}}.",
        "facebook-graph-app-events": "The Graph API is provided by Facebook to “get data into and out of the Facebook platform”.&nbsp;{{< reference url=\"https://developers.facebook.com/docs/graph-api/overview\" >}} It can be accessed through the Facebook SDKs for Android&nbsp;{{< reference url=\"https://developers.facebook.com/docs/android/graph\" >}} and iOS&nbsp;{{< reference url=\"https://developers.facebook.com/docs/ios/graph\" >}}.\n\nThe App Events endpoint allows developers to “track actions that occur in [a] mobile app or web page such as app installs and purchase events” in order to “measure ad performance and build audiences for ad targeting”. The Facebook SDK automatically logs app installs, app sessions, and in-app purchases using this endpoint. Additionally, developers can manually log their own events.&nbsp;{{< reference url=\"https://developers.facebook.com/docs/marketing-api/app-event-api\" >}}",
        "firebaseinstallations": "The Firebase Installations service (FIS) provides a unique identifier for each installed instance of a Firebase app, called Firebase installation ID (FID).&nbsp;{{< reference url=\"https://firebase.google.com/docs/projects/manage-installations\" >}} “Many Firebase services depend on the Firebase Installations API in order to identify app installs and/or authenticate client requests to their servers.”&nbsp;{{< reference url=\"https://console.cloud.google.com/marketplace/product/google/firebaseinstallations.googleapis.com\" >}} Other purposes include user segmentation, message delivery, performance monitoring, tracking the number of unique users, or selecting which configuration values to return.&nbsp;{{< reference url=\"https://firebase.google.com/docs/projects/manage-installations\" >}}\n\nFIDs can also be used by Google Analytics for attribution.&nbsp;{{< reference url=\"https://firebase.google.com/docs/projects/manage-installations\" >}}",
        "googledatatransport-batchlog": "The GoogleDataTransport SDK is a transport layer used internally by many other Firebase (e.g. Crashlytics, Performance, Core) Google (e.g. ML Kit) SDKs and services.&nbsp;{{< reference url=\"https://github.com/firebase/firebase-ios-sdk/issues/8220#issuecomment-858040701\" >}} It batches application-specific data from within an app to Google, using a common endpoint regardless of the actual SDK that was integrated by the app developer.&nbsp;{{< reference url=\"https://stackoverflow.com/a/76334853\" >}}",
        "infonline": "INFOnline provides digital audience measurement for websites and apps.&nbsp;{{< reference url=\"https://www.infonline.de/en/\" >}}\n\nThey offer two separate measurement systems: Census Measurement (IOMb&nbsp;{{< reference url=\"https://www.infonline.de/download/?wpdmdl=7135\" >}}) and INFOnline Measurement pseudonymous (IOMp&nbsp;{{< reference url=\"https://www.infonline.de/download/?wpdmdl=7135\" >}}, formerly SZMnG&nbsp;{{< reference url=\"https://www.infonline.de/faqs/\" >}}). Census Measurement can be recognized by the URL path fragment “base.io”, whereas INFOnline Measurement pseudonymous uses “tx.io”.&nbsp;{{< reference url=\"https://docs.infonline.de/infonline-measurement/en/integration/web/checkliste_web_allgemein/\" >}}\n\nINFOnline boasts with constantly adapting their technology in order to circumvent browser restrictions, ad and tracking blockers, and privacy-preserving changes by operating systems.&nbsp;{{< reference url=\"https://www.infonline.de/measurement/\" >}}",
        "infonline-pseudonymous": "Unlike Census Measurement, which works anonymously without identifiers, INFOnline Measurement pseudonymous “is designed as a pseudonymous system (with client identifiers)”.&nbsp;{{< reference url=\"https://docs.infonline.de/infonline-measurement/en/getting-started/verfahrensbeschreibung/\" >}}\n\nAccording INFOnline’s own documentation, “[…] the pseudonymous INFOnline Measurement may only be loaded and executed if there is active consent from the user of [the] web page. […] The following also applies to apps: Only start the session of pseudonymous measurement if you have the user's consent.”&nbsp;{{< reference url=\"https://docs.infonline.de/infonline-measurement/en/getting-started/rechtliche-auswirkungen/\" >}}",
        "ironsource": "ironSource offers the following services:\n\n- Analytics.&nbsp;{{< reference url=\"https://www.is.com/analytics/\" >}}\n- App monetization for publishers&nbsp;{{< reference url=\"https://www.is.com/monetization/\" >}}, including ad mediation&nbsp;{{< reference url=\"https://www.is.com/mediation/\" >}}, real-time bidding&nbsp;{{< reference url=\"https://www.is.com/in-app-bidding/\" >}}, and A/B testing&nbsp;{{< reference url=\"https://www.is.com/monetization-ab-testing/\" >}}.\n- Advertising for user acquisition, to “[k]eep your best users in your portfolio with cross promotion campaigns”.&nbsp;{{< reference url=\"https://www.is.com/user-growth/\" >}} Advertisers can “[a]ccurately measure the ad revenue generated for each device and impression – from any ad unit, across every ad network.”&nbsp;{{< reference url=\"https://www.is.com/impression-level-revenue/\" >}}\n- Audience segmentation, to “[p]ersonalize the ad experience for different audiences to keep users coming back and encourage them to progress in your game”.&nbsp;{{< reference url=\"https://www.is.com/segments/\" >}}",
        "microsoft-appcenter": "Visual Studio App Center is a collection of services by Microsoft to help developers “continuously build, test, release,\nand monitor apps for every platform.”&nbsp;{{< reference url=\"https://learn.microsoft.com/en-us/appcenter/\" >}}\n\nAmong those services are:\n\n- App Center Diagnostics, to “[collect] information about crashes and errors” in apps.&nbsp;{{< reference url=\"https://learn.microsoft.com/en-us/appcenter/diagnostics/\" >}}\n- App Center Analytics, which “helps [developers] understand user behavior and customer engagement […]. The SDK automatically captures session count and device properties like model, OS version, etc. [Developers] can define [their] own custom events […].”&nbsp;{{< reference url=\"https://learn.microsoft.com/en-us/appcenter/sdk/analytics/android\" >}} By tracking events, developers can “learn more about […] users' behavior and understand the interaction between […] users and […] apps.”&nbsp;{{< reference url=\"https://learn.microsoft.com/en-us/appcenter/analytics/event-metrics\" >}}\n\nRegardless of the particular SDK or service, all data sent to App Center goes to a single endpoint.&nbsp;{{< reference url=\"https://learn.microsoft.com/en-us/appcenter/sdk/data-collected\" >}}",
        "mopub": "MoPub was a mobile app monetization service.&nbsp;{{< reference url=\"https://web.archive.org/web/20210126085400/https://www.mopub.com/en\" >}}\n\nMoPub has since been acquired by AppLovin and integrated into AppLovin MAX.&nbsp;{{< reference url=\"https://www.applovin.com/blog/applovins-acquisition-of-mopub-has-officially-closed/\" >}}",
        "onesignal": "OneSignal provides SDKs and APIs to help developers “send push notifications, in-app messages, SMS, and emails.”&nbsp;{{< reference url=\"https://documentation.onesignal.com/docs/onesignal-platform\" >}}\n\nFor that, it also offers personalization&nbsp;{{< reference url=\"https://onesignal.com/personalization\" >}}, user segmentation&nbsp;{{< reference url=\"https://onesignal.com/targeting-segmentation\" >}}, and A/B testing&nbsp;{{< reference url=\"https://documentation.onesignal.com/docs/ab-testing\" >}} features. Developers can “send personalized messages based on real-time user behavior, […] user attributes, events, location, language, and more”.&nbsp;{{< reference url=\"https://onesignal.com/personalization\" >}} Audience cohorts can be synced from various analytics providers.&nbsp;{{< reference url=\"https://onesignal.com/targeting-segmentation\" >}}\n\nAdditionally, OneSignal offers analytics features. Developers can “[c]reate an understanding as to how [their] messaging drives direct, indirect, and unattributed user actions” and “[e]asily quantify which messages are driving sales, engagement, and more”.&nbsp;{{< reference url=\"https://onesignal.com/analytics\" >}} OneSignal advertises with helping developers “know precisely when a device receives a notification”, even if “[u]sers uninstall apps, swap phones, turn off their phones, or are unreachable”.&nbsp;{{< reference url=\"https://onesignal.com/analytics\" >}} Analytics data can be shared with various third-party tracking companies using integrations.&nbsp;{{< reference url=\"https://onesignal.com/integrations/category/analytics\" >}}",
        "onesignal-add-a-device": "The “Add a device” endpoint is used ”to register a new device with OneSignal.“&nbsp;{{< reference url=\"https://documentation.onesignal.com/v9.0/reference/add-a-device\" >}}",
        "smartbear-bugsnag": "BugSnag offers the following services:\n\n- Error monitoring, collecting and visualizing crash data.&nbsp;{{< reference url=\"https://www.bugsnag.com/error-monitoring/\" >}}\n- Real user monitoring, to “[o]ptimize your application based on real-time user actions with your application” and give “visibility into critical performance metrics like hot and cold app starts, network requests, screen-load time and more.”&nbsp;{{< reference url=\"https://www.bugsnag.com/real-user-monitoring/\" >}}",
        "smartbear-bugsnag-session": "The Session Tracking API is used to “notify Bugsnag of sessions starting in web, mobile or desktop applications.”&nbsp;{{< reference url=\"https://bugsnagsessiontrackingapi.docs.apiary.io/#reference/0/session/report-a-session-starting\" >}}",
        "smartbear-bugsnag-notify": "The Error Reporting API is used to send error reports and crashes to BugSnag.&nbsp;{{< reference url=\"https://bugsnagerrorreportingapi.docs.apiary.io/#reference/0/minidump/send-error-reports\" >}}",
        "singular-net": "Singular offers the following services:\n\n- Analytics on a company's marketing spending and efficacy&nbsp;{{< reference url=\"https://www.singular.net/marketing-analytics/\" >}}, with the goal of “[acquiring] the highest value users”&nbsp;{{< reference url=\"https://www.singular.net/ad-monetization/\" >}}.\n- Tracking and attribution of users, “connecting the install of a mobile app and the user’s activities inside the app to the marketing campaign that led to the installation”.&nbsp;{{< reference url=\"https://www.singular.net/mobile-attribution/\" >}} “For every install, Singular scans its database for relevant ad interactions (ad clicks and ad views) that originated from the same device […]. […] The goal is to reconstruct the user journey as the first step toward finding the touchpoint that most likely led the user to install the app.”&nbsp;{{< reference url=\"https://support.singular.net/hc/en-us/articles/115000526963-Understanding-Singular-Mobile-App-Attribution\" >}} Additionally, Singular attributes the following events to the user: ”User sessions (i.e., every time the user opens the app), Revenue events (purchases made through the app), Any other events that are relevant to [the] app, such as sign-ups, tutorial completions, or level-ups.“, as well as app uninstalls&nbsp;{{< reference url=\"https://support.singular.net/hc/en-us/articles/115000526963-Understanding-Singular-Mobile-App-Attribution\" >}}\n- Mobile ad fraud prevention.&nbsp;{{< reference url=\"https://www.singular.net/fraud-prevention/\" >}}\n\nSingular boasts with being able to track users across devices, using “advertiser-reported IDs to tie different devices to the same user”.&nbsp;{{< reference url=\"https://www.singular.net/cross-device-attribution/\" >}} They claim: “By implementing an API call to the Singular SDK or server with a user ID, Singular helps you sync up users and devices in such a way that you can recognize customers or users and properly attribute conversions to ad spend and marketing activity, plus assign customers or users to cohorts, regardless of which device or platform they’re using at any given moment.”&nbsp;{{< reference url=\"https://www.singular.net/glossary/cross-device-attribution/\" >}}\n\nAdditionally, they pull in, aggregate, standardize, and match tracking data from thousands of partner companies in the fields of analytics, attribution, audience measurement, and ad monetization.&nbsp;{{< reference url=\"https://www.singular.net/partner-integrations/\" >}}"
    }
}
