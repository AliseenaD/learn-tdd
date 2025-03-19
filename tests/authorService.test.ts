import app from "../server";
import request from "supertest";
import Author from "../models/author";

describe('Test the GET of the author service', () => {

    let consoleSpy: jest.SpyInstance;

    beforeAll(() => {
        consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterAll(() => {
        consoleSpy.mockRestore();
    });
    

    it('Should respond with a list of author names and lifetimes sorted by family name of the authors', async () => {
        const mockAuthors = [
            {
                first_name: 'John',
                family_name: 'Doe',
                date_of_birth: '12/21/1998',
                date_of_death: '12/23/2025',
            },
            {
                first_name: 'Matt',
                family_name: 'Zao',
                date_of_birth: '12/21/1998',
                date_of_death: '12/23/2025',
            },
            {
                first_name: 'Charles',
                family_name: 'Apple',
                date_of_birth: '12/21/1998',
                date_of_death: '12/23/2025',
            }
        ];

        const expectedResponse = [...mockAuthors].sort((a,b) => {
            return a.family_name.localeCompare(b.family_name);
        }).map(author => `${author.first_name} ${author.family_name} : ${author.date_of_birth} - ${author.date_of_death}`);

        Author.getAllAuthors = jest.fn().mockImplementation((sortOpts?: { [key: string]: 1 | -1 }) => {
            if (sortOpts && sortOpts.family_name===1) {
                return Promise.resolve(expectedResponse);
            }
            return Promise.resolve(mockAuthors.map(author => `${author.first_name} ${author.family_name} : ${author.date_of_birth} - ${author.date_of_death}`));
        });

        const response = await request(app).get('/authors');
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual(expectedResponse);
    });

    it('Should respond with a "No authors found" message when there are no authors in the database', async () => {
        Author.getAllAuthors = jest.fn().mockImplementation(() => {
            return Promise.resolve([]);
        });
        const response = await request(app).get('/authors');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('No authors found');
    });

    it('Should respond with an error code of 500 when an error occurs when retrieving authors', async () => {
        Author.getAllAuthors = jest.fn().mockRejectedValue(new Error('Database error'));
        const response = await request(app).get('/authors');
        expect(response.statusCode).toBe(500);
        expect(response.text).toStrictEqual('No authors found');
        expect(consoleSpy).toHaveBeenCalled();  
    });
});