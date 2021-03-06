import _ from 'lodash/fp';
import { Observable } from 'rxjs';
import { ajax } from 'rxjs/observable/dom/ajax';
import { createAction } from 'redux-actions';

import { usersUrls } from '../../../../config/server-urls.constants'
import { fetchPatientDiagnosesDetailRequest } from './fetch-patient-diagnoses-detail.duck';
import {handleErrors} from "../../../../ducks/handle-errors.duck";

export const FETCH_PATIENT_DIAGNOSES_REQUEST = 'FETCH_PATIENT_DIAGNOSES_REQUEST';
export const FETCH_PATIENT_DIAGNOSES_SUCCESS = 'FETCH_PATIENT_DIAGNOSES_SUCCESS';
export const FETCH_PATIENT_DIAGNOSES_FAILURE = 'FETCH_PATIENT_DIAGNOSES_FAILURE';
export const FETCH_PATIENT_DIAGNOSES_UPDATE_REQUEST = 'FETCH_PATIENT_DIAGNOSES_UPDATE_REQUEST';

export const fetchPatientDiagnosesRequest = createAction(FETCH_PATIENT_DIAGNOSES_REQUEST);
export const fetchPatientDiagnosesSuccess = createAction(FETCH_PATIENT_DIAGNOSES_SUCCESS);
export const fetchPatientDiagnosesFailure = createAction(FETCH_PATIENT_DIAGNOSES_FAILURE);
export const fetchPatientDiagnosesUpdateRequest = createAction(FETCH_PATIENT_DIAGNOSES_UPDATE_REQUEST);

export const fetchPatientDiagnosesEpic = (action$, store) =>
  action$.ofType(FETCH_PATIENT_DIAGNOSES_REQUEST)
    .mergeMap(({ payload }) =>
      ajax.getJSON(`${usersUrls.PATIENTS_URL}/${payload.userId}/problems`, {
        headers: { Cookie: store.getState().credentials.cookie },
      })
        .map(response => fetchPatientDiagnosesSuccess({
          userId: payload.userId,
          diagnoses: response,
        }))
        // .catch(error => Observable.of(handleErrors(error)))
    );

export const fetchPatientDiagnosesUpdateEpic = (action$, store) =>
  action$.ofType(FETCH_PATIENT_DIAGNOSES_UPDATE_REQUEST)
    .mergeMap(({ payload }) =>
      ajax.getJSON(`${usersUrls.PATIENTS_URL}/${payload.userId}/problems`, {
        headers: { Cookie: store.getState().credentials.cookie },
      })
        .flatMap((response) => {
          const userId = payload.userId;
          const sourceId = payload.sourceId;

          return [
            fetchPatientDiagnosesSuccess({ userId, diagnoses: response }),
            fetchPatientDiagnosesDetailRequest({ userId, sourceId }),
          ]
        })
        // .catch(error => Observable.of(handleErrors(error)))
    );

export default function reducer(patientsDiagnoses = {}, action) {
  switch (action.type) {
    case FETCH_PATIENT_DIAGNOSES_SUCCESS:
      return _.set(action.payload.userId, action.payload.diagnoses, patientsDiagnoses);
    default:
      return patientsDiagnoses;
  }
}
