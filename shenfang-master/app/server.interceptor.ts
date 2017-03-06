import { Interceptor, InterceptedRequest, InterceptedResponse } from 'ng2-interceptors';

export class ServerInterceptor implements Interceptor {
    public interceptBefore(request: InterceptedRequest): InterceptedRequest {
      return request; 
    }
    public interceptAfter(response: InterceptedResponse): InterceptedResponse {
        let body:any = response.response.json();
        if(body.code == 402) location.reload();
        return response;
    }

}
