export default class PokemonAdapter {
    static performAllActions(list, useDBForImages) {
        let result = this.filterPokemon(list, useDBForImages);
        result = this.formatFormNames(result, useDBForImages);
        result = this.fixNames(result);

        return result;
    }

    static filterPokemon(originalList, useDBForImages) {
        let filteredPokemon;

		if (useDBForImages) {
			//filter out forms that have no pokemondb artwork or only minor differences
			filteredPokemon = originalList.filter((value, index, arr) => {
				let tempName = value.name;
				let result = true;

				result = !tempName.match(/-totem/g);
				result = result && !tempName.match(/-cap$/g);
				result = result && !tempName.match(/-cosplay$/g);
				result = result && !tempName.match(/castform-/g);
				result = result && !tempName.match(/-battle-bond$/g);
				result = result && !tempName.match(/-eternal$/g);
				result = result && !tempName.match(/minior-(?!red)/g);
				result = result && !tempName.match(/-power-construct$/g);
				result = result && !tempName.match(/-own-tempo$/g);
				result = result && !tempName.match(/-busted$/g);
				result = result && !tempName.match(/-original$/g);
				result = result && !tempName.match(/cramorant-/g);
				result = result && !tempName.match(/-low-key-gmax$/g);
				result = result && !tempName.match(/-eternamax$/g);
				result = result && !tempName.match(/-dada$/g);
				result = result && !tempName.match(/-bloodmoon$/g);
				result = result && !tempName.match(/-family-of-three$/g);
				result = result && !tempName.match(/squawkabilly-/g);
				result = result && !tempName.match(/-three-segment$/g);
				result = result && !tempName.match(/koraidon-/g);
				result = result && !tempName.match(/miraidon-/g);
				result = result && !tempName.match(/ogerpon-/g);

				return result;
			})
		} else {
			//filter out forms that have no artwork or only minor differences
			filteredPokemon = originalList.filter((value, index, arr) => {
				let tempName = value.name;
				let result = true;

				result = !tempName.match(/-totem/g);
				result = result && !tempName.match(/-cap$/g);
				result = result && !tempName.match(/-cosplay$/g);
				result = result && !tempName.match(/-battle-bond$/g);
				result = result && !tempName.match(/minior-(?!red)/g);
				result = result && !tempName.match(/-power-construct$/g);
				result = result && !tempName.match(/-own-tempo$/g);
				result = result && !tempName.match(/-busted$/g);
				result = result && !tempName.match(/-original$/g);
				result = result && !tempName.match(/cramorant-/g);
				result = result && !tempName.match(/-low-key-gmax$/g);
				result = result && !tempName.match(/-dada$/g);
				result = result && !tempName.match(/koraidon-/g);
				result = result && !tempName.match(/miraidon-/g);

				return result;
			})
		}

        return filteredPokemon;
    }

    static formatFormNames(list, useDBForImages) {
        if (useDBForImages) {
            //change form names to how pokemondb formats them
			for (const pokemon of list) {
				pokemon.name = pokemon.name.replace(/gmax/g, 'gigantamax');
				pokemon.name = pokemon.name.replace(/alola/g, 'alolan');
				pokemon.name = pokemon.name.replace(/galar/g, 'galarian');
				pokemon.name = pokemon.name.replace(/hisui/g, 'hisuian');
				pokemon.name = pokemon.name.replace(/paldea/g, 'paldean');
				pokemon.name = pokemon.name.replace(/starter/g, 'lets-go');
				pokemon.name = pokemon.name.replace(/-red$/g, '-core');
				pokemon.name = pokemon.name.replace(/-red-meteor$/g, '-meteor');
				pokemon.name = pokemon.name.replace(/-disguised$/g, '');
				pokemon.name = pokemon.name.replace(/necrozma-dusk/g, 'necrozma-dusk-mane');
				pokemon.name = pokemon.name.replace(/necrozma-dawn/g, 'necrozma-dawn-wings');
				pokemon.name = pokemon.name.replace(/amped-/g, '');
				pokemon.name = pokemon.name.replace(/zacian$/g, 'zacian-hero');
				pokemon.name = pokemon.name.replace(/zamazenta$/g, 'zamazenta-hero');
				pokemon.name = pokemon.name.replace(/calyrex-ice$/g, 'calyrex-ice-rider');
				pokemon.name = pokemon.name.replace(/calyrex-shadow$/g, 'calyrex-shadow-rider');
				pokemon.name = pokemon.name.replace(/-combat-breed$/g, '');
				pokemon.name = pokemon.name.replace(/paldean-blaze-breed$/g, 'blaze');
				pokemon.name = pokemon.name.replace(/paldean-aqua-breed$/g, 'aqua');
			}
        } else {
            //change form names to improve formatting
			for (const pokemon of list) {
				pokemon.name = pokemon.name.replace(/gmax/g, 'gigantamax');
				pokemon.name = pokemon.name.replace(/-red$/g, '-core');
				pokemon.name = pokemon.name.replace(/-red-meteor$/g, '-meteor');
				pokemon.name = pokemon.name.replace(/-disguised$/g, '');
				pokemon.name = pokemon.name.replace(/necrozma-dusk/g, 'necrozma-dusk-mane');
				pokemon.name = pokemon.name.replace(/necrozma-dawn/g, 'necrozma-dawn-wings');
				pokemon.name = pokemon.name.replace(/amped-/g, '');
				pokemon.name = pokemon.name.replace(/calyrex-ice$/g, 'calyrex-ice-rider');
				pokemon.name = pokemon.name.replace(/calyrex-shadow$/g, 'calyrex-shadow-rider');
				pokemon.name = pokemon.name.replace(/oinkologne$/g, 'oinkologne-male');
			}
        }

        return list;
    }

    static fixNames(list) {
        for (const pokemon of list) {
			//capitalize first letter of pokemon's name
			pokemon.name = pokemon.name.replace(/(^\w{1})|(-\w{1})/g, letter => letter.toUpperCase());

			//fix specific pokemon names with non-alphanumeric characters that don't appear in the api
			pokemon.name = pokemon.name.replace(/fetchd/g, 'fetch\'d');
			pokemon.name = pokemon.name.replace(/Mr-/g, 'Mr. ');
			pokemon.name = pokemon.name.replace(/-Jr/g, ' Jr.');
			pokemon.name = pokemon.name.replace(/Flabebe/g, 'Flab\xE9b\xE9');
			pokemon.name = pokemon.name.replace(/Type-/g, 'Type: ');
			pokemon.name = pokemon.name.replace(/mo-O/g, 'mo-o');
			pokemon.name = pokemon.name.replace(/Tapu-/g, 'Tapu ');
			pokemon.name = pokemon.name.replace(/-10/g, '-10%');
			pokemon.name = pokemon.name.replace(/-50/g, '-50%');
			pokemon.name = pokemon.name.replace(/-Pau/g, '-Pa\'u');
			pokemon.name = pokemon.name.replace(/Great-/g, 'Great ');
			pokemon.name = pokemon.name.replace(/Scream-/g, 'Scream ');
			pokemon.name = pokemon.name.replace(/Brute-/g, 'Brute ');
			pokemon.name = pokemon.name.replace(/Flutter-/g, 'Flutter ');
			pokemon.name = pokemon.name.replace(/Slither-/g, 'Slither ');
			pokemon.name = pokemon.name.replace(/Sandy-/g, 'Sandy ');
			pokemon.name = pokemon.name.replace(/Roaring-/g, 'Roaring ');
			pokemon.name = pokemon.name.replace(/Walking-/g, 'Walking ');
			pokemon.name = pokemon.name.replace(/Gouging-/g, 'Gouging ');
			pokemon.name = pokemon.name.replace(/Raging-/g, 'Raging ');
			pokemon.name = pokemon.name.replace(/Iron-/g, 'Iron ');
		}

        return list;
    }
}