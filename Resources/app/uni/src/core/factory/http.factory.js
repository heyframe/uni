import HeyUni from "@/heyuni-instance";
import {createAPIClient} from "@/api-client";


export default function createHTTPClient(context) {
    return createClient(context);
}

function createClient() {
    const client = createAPIClient({
        baseURL: HeyUni.Context.api.baseURL,
        accessToken: HeyUni.Context.api.accessToken,
    });

    client.hook('onResponseError', (err) => {
        console.error('请求失败：', err);
    });

    return client;
}
