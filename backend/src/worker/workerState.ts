import { log } from "../services/loggerService";

/**
 * Хранит состояние приложения и управляет им
 */
class WorkerState {
  private _lastVpnActDate?: Date;
  private _isActRequired: boolean;

  constructor() {
    log.debug("new WorkerState()");
    this._isActRequired = false;
  }

  /**
   * Ставит отметку о том, что требуется
   * актуализировать группу VPN
   */
  setActRequired(): void {
    log.debug("setActRequired()");
    this._isActRequired = true;
  }

  /**
   * Снимает отметку о потребности актуализации
   */
  setActNotRequired(): void {
    log.debug("setActNotRequired()");
    this._isActRequired = false;
  }

  /**
   * Записывает время актуализации группы VPN
   */
  updateActDate() {
    log.debug("updateActDate()");
    this._lastVpnActDate = new Date();
  }

  /**
   * Возвращает состояние отметки о том, что требуется
   * актуализировать группу VPN
   */
  isActRequired(): boolean {
    log.debug("isActRequired()");
    return this._isActRequired;
  }

  /**
   * Возвращает true если группа VPN актуализировалась
   * в последнюю минуту
   */
  recentlyAct(): boolean {
    log.debug("recentlyAct()");
    if (!this._lastVpnActDate) {
      return false;
    }

    const diff = new Date().valueOf() - this._lastVpnActDate.valueOf();

    if (diff > 1000 * 60) {
      return false;
    } else {
      return true;
    }
  }
}

export const workerState = new WorkerState();
