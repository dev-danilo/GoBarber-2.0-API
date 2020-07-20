import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import IAppointmentsRepository from '@modules/appointments/repositories/IAppointmentsRepository';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import Appointment from '../infra/typeorm/entities/Appointment';

interface IRequest {
  provider_id: string;
  month: number;
  year: number;
  day: number;
}

@injectable()
class ListProviderAppointmentsService {
  constructor(
    @inject('AppointmentsRepository')
    private appointmentRepository: IAppointmentsRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) {}

  public async execute({
    provider_id,
    month,
    year,
    day,
  }: IRequest): Promise<Appointment[]> {
    /* const cacheData = await this.cacheProvider.recover('asd');
    console.log(cacheData); */
    const cachKey = `provider-appointments:${provider_id}:${year}:${month}:${day}`;
    let appointments = await this.cacheProvider.recover<Appointment[]>(cachKey);

    if (!appointments) {
      appointments = await this.appointmentRepository.findAllInDayFromProvider({
        provider_id,
        month,
        year,
        day,
      });
      console.log('buscou do banco'); // nao esta compartilhando cache de dois dias diferentes
      await this.cacheProvider.save(cachKey, appointments);
    }

    return appointments;
  }
}

export default ListProviderAppointmentsService;
