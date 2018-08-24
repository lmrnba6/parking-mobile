import {JsonObject} from "json2typescript";
import * as moment from "moment";

@JsonObject
export class ConnectionStatus {

  emitted: moment.Moment = moment();

  isResolved: boolean = false;
  isAuthenticated: boolean = false;

  isNetworkConnected: boolean = undefined;
  isMqttConnected: boolean = undefined;

  get isConnected() {
    if (!this.isResolved) {
      return true;
    }
    if (this.isAuthenticated) {
      return this.isNetworkConnected && this.isMqttConnected;
    } else {
      return this.isNetworkConnected;
    }
  }

  isSameAs(connectionStatus: ConnectionStatus) {
    return connectionStatus && this.isResolved === connectionStatus.isResolved && this.isAuthenticated === connectionStatus.isAuthenticated && this.isNetworkConnected === connectionStatus.isNetworkConnected && this.isMqttConnected === connectionStatus.isMqttConnected;
  }

}
