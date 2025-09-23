import HeyUni from "@/heyuni-instance";

const HttpClient = HeyUni.Classes._private.HttpFactory;

// eslint-disable-next-line sw-deprecation-rules/private-feature-declarations
export default function initializeHttpClient() {
    return HttpClient(HeyUni.Context.api);
}
