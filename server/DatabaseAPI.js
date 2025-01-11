import sqlite3 from "sqlite3";

/**
 * A class for interfacing with a SQL database containing Pokemon stat Elo information.
 */
export default class DatabaseAPI {
    /**
     * Initializes the API with the database.
     * @constructor
     */
    constructor() {
        this.db = new sqlite3.Database('./pokemon.db');
    }

    /**
     * Adds new Pokemon to the database with default information.
     * @param {Object[]} list Array of Pokemon objects to be added.
     * @returns {Promise} A Promise which is resolved when an attempt to add every Pokemon in the list has been made.
     */
    addPokemon(list) {
        return new Promise((resolve, reject) => {
            for (const pokemon of list) {
                let sql = `INSERT INTO pokemon (id, name, hp, hp_match_number, hp_reached_threshold, attack, attack_match_number, attack_reached_threshold, 
                    defense, defense_match_number, defense_reached_threshold, special_attack, special_attack_match_number, special_attack_reached_threshold, 
                    special_defense, special_defense_match_number, special_defense_reached_threshold, speed, speed_match_number, speed_reached_threshold)
                    VALUES (${pokemon.id}, "${pokemon.name}", 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0)`;

                this.db.run(sql, (err) => {
                    if(err['code'] != 'SQLITE_CONSTRAINT') {
                        //Pokemon already exists in the database
                        reject(err);
                    }
                    else
                        resolve();
                });
            }
        });
    }

    /**
     * Retrieves the list of Pokemon and their Elo scores for each stat from the database.
     * @param {string} sortingStat The stat to sort the Pokemon by.
     * @param {string} ascending The sort order. Should be '1' for true or '' for false.
     * @returns {Promise<Object[]>} A Promise representing an array of Pokemon Objects.
     */
    getAllPokemon(sortingStat, ascending) {
        return new Promise((resolve, reject) => {
            let order = 'DESC';
            if (ascending) {
                order = 'ASC';
            }

            //total Elo across all stats is used as a sorting tiebreaker
            let sql = `SELECT id, name, hp, attack, defense, special_attack, special_defense, speed
                FROM pokemon
                ORDER BY ${sortingStat} ${order}, hp + attack + defense + special_attack + special_defense + speed ${order}`;

            this.db.all(sql, (err, rows) => {
                if(err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }

    /**
     * Retrieves the Elo score and related information for a single stat of a specific Pokemon from the database.
     * @param {number} id The Pokemon/form's unique id.
     * @param {string} stat The stat to retrieve.
     * @returns {Promise<Object>} A Promise representing an Object containing the requested record.
     */
    getPokemonStatElo(id, stat) {
        return new Promise((resolve, reject) => {
            let matchNumber = stat + "_match_number";
	        let reachedThreshold = stat + "_reached_threshold";

            let sql = `SELECT ${stat}, ${matchNumber}, ${reachedThreshold}
                FROM pokemon
                WHERE id = ${id}`;

            this.db.get(sql, (err, rows) => {
                if(err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }

    /**
     * Update a Pokemon's Elo and related numbers for a single stat in the database.
     * @param {number} id The Pokemon's unique id.
     * @param {string} stat The stat to update.
     * @param {number} elo The new Elo score.
     * @param {number} matchNumber How many votes have been made regarding this stat for this Pokemon.
     * @param {number} reachedThreshold Whether the Elo for this stat has ever reached >= 2400 or <= -400. Should be 1 for true and 0 for false.
     * @returns {Promise} A Promise that resolves when the database has been updated.
     */
    updatePokemonStatElo(id, stat, elo, matchNumber, reachedThreshold) {
        return new Promise((resolve, reject) => {
            let matchNumberName = stat + "_match_number";
	        let reachedThresholdName = stat + "_reached_threshold";

            let sql = `UPDATE pokemon
                SET ${stat} = ${elo}, ${matchNumberName} = ${matchNumber}, ${reachedThresholdName} = ${reachedThreshold}
                WHERE id = ${id}`;

            this.db.run(sql, (err) => {
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}