import faker from 'faker';

export const tableValuesMock = new Array(1000)
  .fill(true)
  .map((_, index) => (index === 0
    ? [
      '',
      'Name',
      'Job Title',
      'City',
      'Phone Number',
      'Url',
      'Paragraph',
      'Bitcoin Address',
      'Notes',
    ]
    : [
      index,
      faker.name.findName(),
      faker.name.jobTitle(),
      faker.address.city(),
      faker.phone.phoneNumber(),
      faker.internet.url(),
      faker.lorem.paragraph(3),
      faker.finance.bitcoinAddress(),
      faker.lorem.paragraph(5),
    ]));
