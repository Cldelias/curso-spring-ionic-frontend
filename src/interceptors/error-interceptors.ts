import { FieldMessage } from './../models/fieldmessage';
import { StorageService } from './../services/storage.service';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HTTP_INTERCEPTORS } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { AlertController } from 'ionic-angular';

@Injectable()
export class ErrorInterceptors implements HttpInterceptor {

    constructor(public storage: StorageService, public alertCtrl : AlertController) {

    }

    intercept(req: HttpRequest<any>, next: HttpHandler) : Observable<HttpEvent<any>> {
        return next.handle(req)
        .catch((error, caught) => {
            let errorObj = error;
            if (errorObj.error) {
                errorObj = errorObj.error;
            }
            if (!errorObj.status) {
                errorObj = JSON.parse(errorObj);
            }
            console.log("Erro detectado pelo interceptor");
            console.log(errorObj);

            switch(errorObj.Status) {
                case 401:
                this.handle401();
                break;
                case 403:
                this.handle403();
                break;
                case 422:
                this.handle422(errorObj);
                break;
                default:
                this.handleDefaultErro(errorObj);
                break;
            }
            return Observable.throw(errorObj);
        }) as any;
    }

    handle403() {
        this.storage.setLocalUser(null);
    }

    handle401() {
        let alert = this.alertCtrl.create({
            title : 'Erro 401: Falha de autenticação',
            message : 'Email ou senha incorretos',
            enableBackdropDismiss: false,
            buttons: [
                {
                    text: 'Ok'
                }
            ]


        })
        alert.present();
    }

    handle422(errorObj) {
        let alert = this.alertCtrl.create({
            title : 'Erro 422: validação',
            message : this.listErrors(errorObj.error),
            enableBackdropDismiss: false,
            buttons: [
                {
                    text: 'Ok'
                }
            ]
        })
        alert.present();
    }

    listErrors(messages: FieldMessage[]) : string {
        let s : string = '';
        for (var i = 0; i < messages.length; i++) {
            s = s + '<p><strong>' + messages[i].fieldName + "</strong> " + messages[i].message + '</p>';
        }
        return s;
    }

    handleDefaultErro(errorObj) {
        let alert = this.alertCtrl.create({
            title : 'Erro ' + errorObj.status + ':' + errorObj.error,
            message : errorObj.message,
            enableBackdropDismiss: false,
            buttons: [
                {
                    text: 'Ok'
                }
            ]
        })
        alert.present();
    }


}

export const ErrorInterceptorsProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptors,
    multi: true,
};