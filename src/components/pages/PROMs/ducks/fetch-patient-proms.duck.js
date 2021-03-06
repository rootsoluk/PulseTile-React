import _ from 'lodash/fp';
import { Observable } from 'rxjs';
import { ajax } from 'rxjs/observable/dom/ajax';
import { createAction } from 'redux-actions';

import { usersUrls } from '../../../../config/server-urls.constants'
import { fetchPatientPromsDetailRequest } from './fetch-patient-proms-detail.duck';
import { handleErrors } from '../../../../ducks/handle-errors.duck';

export const FETCH_PATIENT_PROMS_REQUEST = 'FETCH_PATIENT_PROMS_REQUEST';
export const FETCH_PATIENT_PROMS_SUCCESS = 'FETCH_PATIENT_PROMS_SUCCESS';
export const FETCH_PATIENT_PROMS_FAILURE = 'FETCH_PATIENT_PROMS_FAILURE';
export const FETCH_PATIENT_PROMS_UPDATE_REQUEST = 'FETCH_PATIENT_PROMS_UPDATE_REQUEST';

export const fetchPatientPromsRequest = createAction(FETCH_PATIENT_PROMS_REQUEST);
export const fetchPatientPromsSuccess = createAction(FETCH_PATIENT_PROMS_SUCCESS);
export const fetchPatientPromsFailure = createAction(FETCH_PATIENT_PROMS_FAILURE);
export const fetchPatientPromsUpdateRequest = createAction(FETCH_PATIENT_PROMS_UPDATE_REQUEST);

export const fetchPatientPromsEpic = (action$, store) =>
  action$.ofType(FETCH_PATIENT_PROMS_REQUEST)
    .mergeMap(({ payload }) =>
      ajax.getJSON(`${usersUrls.PATIENTS_URL}/${payload.userId}/proms`, {
        headers: { Cookie: store.getState().credentials.cookie },
      })
        .map(response => fetchPatientPromsSuccess({
          userId: payload.userId,
          proms: response,
        }))
        // .catch(error => Observable.of(handleErrors(error)))
    );

export const fetchPatientPromsUpdateEpic = (action$, store) =>
  action$.ofType(FETCH_PATIENT_PROMS_UPDATE_REQUEST)
    .mergeMap(({ payload }) =>
      ajax.getJSON(`${usersUrls.PATIENTS_URL}/${payload.userId}/proms`, {
        headers: { Cookie: store.getState().credentials.cookie },
      })
        .flatMap((response) => {
          const userId = payload.userId;
          const sourceId = payload.sourceId;

          return [
            fetchPatientPromsSuccess({ userId, proms: response }),
            fetchPatientPromsDetailRequest({ userId, sourceId }),
          ]
        })
        // .catch(error => Observable.of(handleErrors(error)))
    );

export default function reducer(patientsProms = {}, action) {
  switch (action.type) {
    case FETCH_PATIENT_PROMS_SUCCESS:
      return _.set(action.payload.userId, action.payload.proms, patientsProms);
    default:
      return patientsProms;
  }
}
